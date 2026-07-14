<?php
namespace SmackCoders\WETC;

if (!defined('ABSPATH')) {
    die;
}

class WETC_AI_Handler {

    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action('wp_ajax_wetc_generate_ai_content', [$this, 'generate_ai_content_callback']);
        add_action('wp_ajax_wetc_generate_ai_image', [$this, 'generate_ai_image_callback']);
    }

    public function generate_ai_content_callback() {
        if (!check_ajax_referer('get_template_json_nonce', '_ajax_nonce', false)) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            wp_die();
        }

        $ai_provider = isset($_POST['ai_provider']) ? sanitize_text_field(wp_unslash($_POST['ai_provider'])) : 'openai';
        $ai_model = isset($_POST['ai_model']) ? sanitize_text_field(wp_unslash($_POST['ai_model'])) : '';
        $action = isset($_POST['ai_action']) ? sanitize_text_field(wp_unslash($_POST['ai_action'])) : 'prompt';
        $prompt = isset($_POST['prompt']) ? sanitize_textarea_field(wp_unslash($_POST['prompt'])) : '';
        $context = isset($_POST['context']) ? sanitize_textarea_field(wp_unslash($_POST['context'])) : '';
        $tone = isset($_POST['tone']) ? sanitize_text_field(wp_unslash($_POST['tone'])) : '';
        
        if (empty($prompt) && empty($context)) {
            wp_send_json_error(['message' => 'Prompt or context is required']);
            wp_die();
        }

        $system_prompt = "You are a professional email marketing copywriter generating content for a specific block inside an email. DO NOT include a Subject line, Preheader, Greetings (e.g., 'Hi there'), or Sign-offs (e.g., 'Best regards'). Provide only minimal, effective text content. IMPORTANT: Format your response using valid HTML tags (like <p>, <br>, <strong>, <ul>, <li>, <h3>, etc.) instead of Markdown. Do not include markdown code block syntax like ```html.";
        $user_prompt = "";
        $full_prompt = "";

        switch ($action) {
            case 'tone':
                $user_prompt = "Rewrite the following content to sound $tone:\n\n$context";
                $full_prompt = $system_prompt . "\n\n" . $user_prompt;
                break;
            case 'summarize':
                $user_prompt = "Summarize the following content into concise, impactful snippets:\n\n$context";
                $full_prompt = $system_prompt . "\n\n" . $user_prompt;
                break;
            case 'expand':
                $user_prompt = "Expand the following content into a persuasive text block:\n\n$context";
                $full_prompt = $system_prompt . "\n\n" . $user_prompt;
                break;
            case 'correct':
                $user_prompt = "Correct any spelling and grammatical errors in the following text, and improve clarity. Retain the original HTML/MJML tags if present:\n\n$context";
                $full_prompt = $system_prompt . "\n\n" . $user_prompt;
                break;
            case 'prompt':
            default:
                $user_prompt = !empty($prompt) ? $prompt : $context;
                $full_prompt = $system_prompt . "\n\n" . $user_prompt;
                break;  
        }

        try {
            if (!function_exists('wp_ai_client_prompt')) {
                throw new \Exception('wp_ai_client_prompt function is not available on this site.');
            }
            
            $builder = wp_ai_client_prompt($full_prompt);
            
            if (!empty($ai_provider)) {
                $builder->using_provider($ai_provider);
            }

            if (!empty($ai_model)) {
                $builder->using_model_preference($ai_model);
            }

            $response = $builder->generate_text();

            if (is_wp_error($response)) {
                throw new \Exception($response->get_error_message());
            }

            // Remove any markdown code block wrappers (e.g., ```html ... ```)
            $response = preg_replace('/^```(?:html)?\s*(.*?)\s*```$/is', '$1', trim($response));
            
            // Only replace placeholders if it's not a direct prompt, OR if we strictly want it everywhere.
            // Let's replace placeholders to keep email tokens working unless it's the raw prompt action.
            if ($action !== 'prompt') {
                $response = $this->replace_ai_placeholders($response);
            }
            
            wp_send_json_success(['result' => $response]);
        } catch (\Exception $e) {
            wp_send_json_error(['message' => $e->getMessage()]);
        }
        wp_die();
    }

    /**
     * Replaces common AI-generated generic placeholder patterns with the plugin's
     * real {{merge_tag}} dynamic variables. This makes AI-generated email content
     * immediately usable without manual editing.
     */
    private function replace_ai_placeholders($text) {
        // Map of regex pattern => merge tag replacement
        // Patterns are ordered from most specific to most general to avoid conflicts.
        $replacements = [

            // --- Customer Name ---
            "/\[(?:Customer'?s?\s+)?Full\s+Name\]/i"            => '{{customer_name}}',
            "/\[(?:Customer'?s?\s+)?First\s+Name\]/i"           => '{{customer_first_name}}',
            "/\[(?:Customer'?s?\s+)?Last\s+Name\]/i"            => '{{customer_last_name}}',
            '/\[(?:First\s+Name|FirstName)\]/i'                     => '{{customer_first_name}}',
            '/\[(?:Last\s+Name|LastName)\]/i'                       => '{{customer_last_name}}',
            '/\[(?:Customer\s+)?Name\]/i'                            => '{{customer_name}}',
            '/\[(?:Hi|Hello),?\s+[A-Za-z\s]+\]/i'                   => 'Hi {{customer_first_name}},',

            // --- Order Details ---
            '/#(?:XXXX|ORDER_?(?:NUMBER|ID|NUM)|ORDERNUMBER|\[Order\s+Number\])/i' => '{{order_number}}',
            '/\[Order\s+(?:Number|ID|Num)\]/i'                       => '{{order_number}}',
            '/\[Order\s+Date(?:\s+&\s+Time)?\]/i'                    => '{{order_date}}',
            '/\[(?:Estimated\s+)?Delivery\s+Date\]/i'                => '{{order_date}}',
            '/\[(?:Delivery|Dispatch)\s+Date\]/i'                    => '{{order_date}}',
            '/\[Within\s+X\s+business\s+days?\]/i'                   => '{{order_date}}',
            '/\[Order\s+Total\]/i'                                    => '{{order_total}}',
            '/\[(?:Grand\s+)?Total\]/i'                               => '{{order_total}}',
            '/\$\[(?:Grand\s+)?Total\]/i'                             => '{{order_total}}',
            '/\[Subtotal\]/i'                                         => '{{order_subtotal}}',
            '/\$\[Subtotal\]/i'                                       => '{{order_subtotal}}',
            '/\[Taxes?\]/i'                                           => '{{order_tax}}',
            '/\$\[Taxes?\]/i'                                         => '{{order_tax}}',
            '/\[Shipping\s+(?:Cost|Fee|Amount)?\]/i'                  => '{{order_shipping}}',
            '/\$\[Shipping(?:\s+Cost)?\]/i'                           => '{{order_shipping}}',
            '/\[Shipping\s+Method\]/i'                                => '{{shipping_method}}',
            '/\[(?:Standard|Express|Overnight)\]/i'                   => '{{shipping_method}}',
            '/\[Payment\s+Method\]/i'                                 => '{{payment_method}}',
            '/\[Order\s+Status\]/i'                                   => '{{order_status}}',

            // --- Tracking / URLs ---
            '/\[Insert\s+Tracking\s+Link\]/i'                         => '{{order_url}}',
            '/\[Tracking\s+(?:Link|URL|Number|Info)\]/i'              => '{{order_url}}',
            '/\[Track\s+(?:Your\s+)?Order\]/i'                        => '{{order_url}}',
            '/\[Order\s+(?:Link|URL)\]/i'                             => '{{order_url}}',

            // --- Shipping Address ---
            "/\[Customer'?s?\s+(?:Shipping\s+)?Address\]/i"       => '{{shipping_address_1}}, {{shipping_city}}, {{shipping_state}} {{shipping_postcode}}',
            '/\[Shipping\s+Address\]/i'                               => '{{shipping_address_1}}, {{shipping_city}}, {{shipping_state}} {{shipping_postcode}}',
            '/\[Billing\s+Address\]/i'                                => '{{billing_address_1}}, {{billing_city}}, {{billing_state}} {{billing_postcode}}',
            '/\[Address\]/i'                                          => '{{billing_address_1}}, {{billing_city}}, {{billing_state}} {{billing_postcode}}',

            // --- Store / Brand ---
            '/\[(?:Your\s+)?Brand\s+Name\]/i'                        => '{{store_name}}',
            '/\[(?:Your\s+)?(?:Company|Store|Shop|Business|Brand)\s+Name\]/i' => '{{store_name}}',
            '/\[(?:Your\s+)?Brand\]/i'                               => '{{store_name}}',
            '/@\[(?:Your)?Brand(?:Handle)?\]/i'                       => '{{store_name}}',
            '/@YourBrandHandle/i'                                     => '{{store_name}}',
            '/#\[(?:Your)?Brand(?:Hashtag)?\]/i'                      => '{{store_name}}',
            '/\[(?:Your\s+)?Store\s+Name\]/i'                        => '{{store_name}}',

            // --- Contact ---
            '/\[(?:support@)?(?:your)?brand(?:\.com)?\]/i'           => '{{store_email}}',
            '/\[support@yourbrand\.com\]/i'                           => '{{store_email}}',
            '/\[(?:Your\s+)?(?:Support\s+)?Email(?:\s+Address)?\]/i'  => '{{store_email}}',
            '/\[(?:Store|Shop|Brand|Company)\s+Email\]/i'             => '{{store_email}}',
            '/\[phone\s+number\]/i'                                   => '{{store_phone}}',
            '/\[(?:Store|Shop|Brand|Your)\s+Phone(?:\s+Number)?\]/i'  => '{{store_phone}}',
            '/\[(?:Your\s+)?(?:Support\s+Line|Contact\s+Number)\]/i'  => '{{store_phone}}',

            // --- Price / Amount placeholders (generic, catch-all) ---
            '/\$\[Amount\]/i'                                         => '{{order_total}}',
            '/\[Amount\]/i'                                           => '{{order_total}}',

            // --- Misc ---
            '/\[Date\]/i'                                             => '{{order_date}}',
            '/\[Current\s+Year\]/i'                                   => '{{current_year}}',
            '/\[Year\]/i'                                             => '{{current_year}}',
            '/\[(?:Customer|Your)\s+Email(?:\s+Address)?\]/i'         => '{{customer_email}}',
        ];

        foreach ($replacements as $pattern => $replacement) {
            $text = preg_replace($pattern, $replacement, $text);
        }

        return $text;
    }

    public function generate_ai_image_callback() {
        if (!check_ajax_referer('get_template_json_nonce', '_ajax_nonce', false)) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            wp_die();
        }

        $prompt = isset($_POST['prompt']) ? sanitize_textarea_field(wp_unslash($_POST['prompt'])) : '';
        if (empty($prompt)) {
            wp_send_json_error(['message' => 'Prompt is required for image generation']);
            wp_die();
        }

        $provider = isset($_POST['provider']) ? sanitize_text_field(wp_unslash($_POST['provider'])) : 'huggingface';
        $api_key = get_option('wetc_ai_' . $provider . '_key');

        if (empty($api_key)) {
            wp_send_json_error(['message' => 'API Key is not configured for ' . strtoupper($provider)]);
            wp_die();
        }

        try {
            if ($provider == 'huggingface') {
                $image_url = $this->call_huggingface_image($api_key, $prompt);
                wp_send_json_success(['image_url' => $image_url]);
            } elseif ($provider == 'pollinations') {
                $image_url = $this->call_pollinations_image($api_key, $prompt);
                wp_send_json_success(['image_url' => $image_url]);
            } else {
                wp_send_json_error(['message' => 'Image generation is supported via Hugging Face or Pollinations.ai.']);
            }
        } catch (\Exception $e) {
            wp_send_json_error(['message' => $e->getMessage()]);
        }
        wp_die();
    }



    private function call_huggingface_image($api_key, $prompt) {
        // Using Stable Diffusion XL — confirmed supported model for hf-inference provider text-to-image.
        // Reference: https://huggingface.co/docs/inference-providers/en/providers/hf-inference#text-to-image
        // Note: The /v1/text-to-image suffix is only for OpenAI-compatible endpoints, not for task models.
        $model_id = 'stabilityai/stable-diffusion-xl-base-1.0';
        $url = 'https://router.huggingface.co/hf-inference/models/' . $model_id;
        
        $body = wp_json_encode([
            'inputs' => $prompt,
        ]);

        // Hugging Face inference API returns raw image bytes natively, not JSON, unless there's an error.
        $response = wp_remote_post($url, [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ],
            'body' => $body,
            'timeout' => 60
        ]);

        if (is_wp_error($response)) {
            throw new \Exception(esc_html($response->get_error_message()));
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $body_content = wp_remote_retrieve_body($response);

        // Check if the response is JSON (means it's an error)
        $json_data = json_decode($body_content, true);
        if ($json_data && isset($json_data['error'])) {
            // Models might be loading "Model runwayml/stable-diffusion-v1-5 is currently loading" -> $json_data['estimated_time']
            if(isset($json_data['estimated_time'])) {
                 throw new \Exception(esc_html("Model is currently loading (" . round($json_data['estimated_time']) . " seconds remaining). Please click generate again in a few moments."));
            }
            throw new \Exception(esc_html(is_array($json_data['error']) ? implode(', ', $json_data['error']) : $json_data['error']));
        }
        
        if ($response_code !== 200) {
           throw new \Exception(esc_html('Hugging Face API returned error code: ' . $response_code));
        }

        // Response is binary image data, we need to convert to base64 so React can display it instantly
        $content_type = wp_remote_retrieve_header($response, 'content-type');
        if (empty($content_type)) {
            $content_type = 'image/jpeg';
        }

        $base64 = base64_encode($body_content);
        $data_uri = 'data:' . $content_type . ';base64,' . $base64;

        return $data_uri;
    }

    private function call_pollinations_image($api_key, $prompt) {
        // Pollinations.ai now offers a high-priority OpenAI-compatible API.
        // This endpoint supports b64_json for instant delivery and bypasses standard rate limits.
        $url = 'https://gen.pollinations.ai/v1/images/generations';
        
        $body = wp_json_encode([
            'prompt'          => $prompt,
            'n'               => 1,
            'size'            => '1024x1024',
            'response_format' => 'b64_json',
        ]);

        $response = wp_remote_post($url, [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type'  => 'application/json',
            ],
            'body'    => $body,
            'timeout' => 60
        ]);

        if (is_wp_error($response)) {
            throw new \Exception(esc_html($response->get_error_message()));
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $body_content = wp_remote_retrieve_body($response);
        $data = json_decode($body_content, true);

        if ($response_code !== 200) {
            $error_msg = isset($data['error']['message']) ? $data['error']['message'] : 'Pollinations AI API returned error code: ' . $response_code;
            throw new \Exception(esc_html($error_msg));
        }

        if (empty($data['data'][0]['b64_json'])) {
            throw new \Exception(esc_html('Invalid response structure from Pollinations AI.'));
        }

        // Return as Data URI so React can display it instantly without another request
        return 'data:image/png;base64,' . $data['data'][0]['b64_json'];
    }
}
