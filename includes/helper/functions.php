<?php

namespace SmackCoders\WETC;

if (!defined('ABSPATH')) {
    die;
}
   
class WETC_Email_Handler {

    private static $instance = null;

    public static function log($message) {
        // Logging disabled for production
    }

    private function __construct() {
        // Disable default WooCommerce emails ONLY if we have a replacement template
        $emails_to_disable = [
            'new_order',
            'cancelled_order',
            'failed_order',
            'customer_failed_order',
            'customer_on_hold_order',
            'customer_processing_order',
            'customer_completed_order',
            'customer_refunded_order',
            'customer_invoice',
            'customer_note',
            'customer_reset_password',
            'customer_new_account',
            'new_account'
        ];

        foreach ($emails_to_disable as $email_id) {
            add_filter("woocommerce_email_enabled_{$email_id}", [$this, 'should_disable_default_email'], 9999, 2);
        }

        // Additional abandonment cart disable if applicable
        add_filter('woocommerce_email_enabled_abandoned_cart', [$this, 'should_disable_default_email'], 9999, 2);

        // Hook 
        add_action('woocommerce_order_status_processing', [$this,'processing_order_email'], 10, 1);
        add_action('woocommerce_order_status_processing', [$this,'new_order_admin_email'], 10, 1);
        add_action('woocommerce_order_status_pending_to_processing_notification', [$this,'new_order_admin_email'], 10, 1);
        add_action('woocommerce_order_status_pending_to_completed_notification', [$this,'new_order_admin_email'], 10, 1);
        add_action('woocommerce_order_status_pending_to_on-hold_notification', [$this,'new_order_admin_email'], 10, 1);
        add_action('woocommerce_order_status_failed_to_processing_notification', [$this,'new_order_admin_email'], 10, 1);
        add_action('woocommerce_order_status_failed_to_completed_notification', [$this,'new_order_admin_email'], 10, 1);
        add_action('woocommerce_new_order', [$this,'new_order_admin_email'], 10, 1);
        add_action('woocommerce_order_status_failed', [$this,'failed_order_email'], 10, 1);
        add_action('woocommerce_order_status_failed', [$this,'failed_order_email_admin'], 10, 1);
        add_action('woocommerce_order_status_on-hold', [$this,'on_hold_order_email'], 10, 1);
        add_action('woocommerce_order_fully_refunded', [$this, 'refunded_order_email'], 10, 2);
        add_action('woocommerce_order_partially_refunded', [$this, 'refunded_order_email'], 10, 2);
        add_action('woocommerce_order_status_cancelled', [$this, 'cancelled_order_email'], 10, 1);
        add_action('woocommerce_order_status_cancelled', [$this, 'cancelled_order_email_admin'], 10, 1);
        add_action('woocommerce_order_status_completed', [$this,'completed_order_email'], 10, 1);
        add_action('woocommerce_order_status_completed', [$this,'new_order_admin_email'], 10, 1);
        
        // --- Explicit On-Hold Hooks (for better fallback/custom triggering) ---
        add_action('woocommerce_order_status_pending_to_on-hold_notification', [$this,'on_hold_order_email'], 10, 1);
        add_action('woocommerce_order_status_processing_to_on-hold_notification', [$this,'on_hold_order_email'], 10, 1);
        
        // Admin Cancellation Hooks
        add_action('woocommerce_order_status_pending_to_cancelled_notification', [$this, 'cancelled_order_email_admin'], 10, 1);
        add_action('woocommerce_order_status_on-hold_to_cancelled_notification', [$this, 'cancelled_order_email_admin'], 10, 1);
        add_action('woocommerce_order_status_processing_to_cancelled_notification', [$this, 'cancelled_order_email_admin'], 10, 1);
        add_action('woocommerce_order_status_cancelled_notification', [$this, 'cancelled_order_email_admin'], 10, 1);
        
        add_action('woocommerce_order_status_abandoned-cart', [$this, 'abandoned_cart_email'], 10, 1);
        add_action('woocommerce_created_customer', [$this,'new_user_registration_email'], 99, 1);
        add_action('woocommerce_created_customer', [$this,'new_user_registration_email_admin'], 99, 1);
        add_action('woocommerce_new_customer_note', [$this, 'customer_note_email'], 10, 1);
        add_action('woocommerce_email_customer_invoice', [$this, 'customer_invoice_email'], 10, 1);
        add_action('woocommerce_after_resend_order_email', [$this, 'handle_resend_notification'], 10, 2);

        /* // Commented out to prevent double emails now that standard hooks are confirmed working
        add_action('woocommerce_order_action_send_email_customer_processing_order', function($order) { 
            $this->processing_order_email($order->get_id(), true); 
        });
        add_action('woocommerce_order_action_send_email_customer_completed_order', function($order) { 
            $this->completed_order_email($order->get_id(), true); 
        });
        add_action('woocommerce_order_action_send_email_customer_invoice', function($order) { 
            $this->customer_invoice_email($order->get_id(), true); 
        });
        add_action('woocommerce_order_action_resend_order_notification', function($order) { 
            $this->new_order_admin_email($order->get_id(), true); 
        });
        */

        add_filter('retrieve_password_message', [$this, 'reset_password_email'], 10, 4);
        add_action('woocommerce_reset_password_notification', [$this, 'woocommerce_reset_password_notification'], 1, 2);
        add_action('init', [$this, 'custom_email_open_tracker']);
        add_action('init', [$this, 'custom_email_click_tracker']);
        add_action('rest_api_init', [$this, 'register_tracker_verification_endpoint']);

        



        add_action('wp_mail_failed', function($error) {
            global $wpdb;
            $table_logs = $wpdb->prefix . 'woo_email_logs';
            
            // Extract mail data from WP_Error object
            $error_data = $error->get_error_data('wp_mail_failed');
            if (!$error_data) return;

            $to = is_array($error_data['to']) ? implode(',', $error_data['to']) : $error_data['to'];
            $subject = $error_data['subject'];
            $error_message = $error->get_error_message();

            // Update the most recent log entry to failed
            $wpdb->query($wpdb->prepare(
                "UPDATE {$table_logs} SET status = 'failed', error_message = %s WHERE recipient = %s AND subject = %s ORDER BY id DESC LIMIT 1",
                $error_message, $to, $subject
            ));
        });

    }

public static function get_instance() {
    if (self::$instance === null) {
        self::$instance = new self();
    }
    return self::$instance;
}

private function get_order_id_from_object($email) {
    if (isset($email->object) && is_a($email->object, 'WC_Order')) {
        return $email->object->get_id();
    }
    return null;
}

    public function should_disable_default_email($enabled, $email = null) {
        $filter = current_filter();
        $email_id = str_replace('woocommerce_email_enabled_', '', $filter);
        
        if (empty($email_id) || $email_id === $filter) {
            if (is_object($email) && isset($email->id)) {
                $email_id = $email->id;
            } elseif (is_string($email)) {
                $email_id = $email;
            }
        }

        if (empty($email_id)) {
            return $enabled;
        }

        $content_types = $this->map_wc_email_id_to_wetc_type($email_id);

        if ($content_types) {
            $types = is_array($content_types) ? $content_types : [$content_types];
            foreach ($types as $type) {
                if (empty($type)) continue;
                $template = $this->get_active_template_for_type($type);
                if ($template && !empty($template->content_type)) {
                    if (!empty($template->html_content)) {
                        return false; 
                    }
                }
            }
        }

        return $enabled;
    }

    private function map_wc_email_id_to_wetc_type($email_id) {
        $map = [
            'new_order'                 => 'new_order_admin',
            'cancelled_order'           => 'cancelled_order_admin',
            'failed_order'              => 'failed_order_admin',
            'customer_on_hold_order'    => 'on_hold_order',
            'customer_processing_order' => 'processing_order_customer',
            'customer_completed_order'  => 'completed_order_customer',
            'customer_refunded_order'   => ['refunded_order_customer', 'refunded_order_customer_full', 'refunded_order_customer_partial'],
            'customer_invoice'          => ['customer_invoice', 'customer_invoice_paid', 'customer_invoice_pending'],
            'customer_note'             => 'customer_note',
            'customer_reset_password'   => 'reset_password',
            'customer_new_account'      => 'new_user_registration',
            'new_account'               => 'new_user_registration_admin',
            'abandoned_cart'            => 'abandoned_cart',
            'customer_failed_order'     => 'failed_order_customer'
        ];

        return isset($map[$email_id]) ? $map[$email_id] : null;
    }


    private function get_active_template_for_type($content_type) {
        $content_type = trim((string)$content_type);
        if (empty($content_type) || $content_type === 'JSON') {
            return null;
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'wetc_email_templates';
        
        // Mapping from internal slugs to Descriptive Names (to support new user-friendly DB values)
        $slug_to_name_map = [
            'cancelled_order_admin' => 'Cancelled order (Admin)',
            'failed_order_admin' => 'Failed order (Admin)',
            'new_order_admin' => 'New order (Admin)',
            'cancelled_order_customer' => 'Cancelled order (Customer)',
            'completed_order_customer' => 'Completed order (Customer)',
            'customer_note' => 'Customer note',
            'failed_order_customer' => 'Failed order (Customer)',
            'new_user_registration' => 'New account (Customer)',
            'customer_invoice_paid' => 'Order details (Paid)',
            'customer_invoice_pending' => 'Order details (Pending)',
            'on_hold_order' => 'Order on-hold (Customer)',
            'processing_order_customer' => 'Processing order (Customer)',
            'refunded_order_customer_full' => 'Refunded order (Full)',
            'refunded_order_customer_partial' => 'Refunded order (Partial)',
            'reset_password' => 'Reset password (Customer)'
        ];

        $search_types = [$content_type];
        if (isset($slug_to_name_map[$content_type])) {
            $search_types[] = $slug_to_name_map[$content_type];
        }

        // --- Robust Searching ---
        foreach ($search_types as $type_to_find) {
            // 1. Try exact match with highest priority
            $row = $wpdb->get_row($wpdb->prepare( // phpcs:ignore
                "SELECT * FROM $table_name WHERE content_type = %s AND (status = 'publish' OR status IS NULL OR status = '') ORDER BY priority DESC, id DESC LIMIT 1", // phpcs:ignore
                $type_to_find
            ));

            if ($row) return $row;
        }

        // 2. Try normalized fallback (if exact match fails for all variants)
        $normalized_input = str_replace(' ', '_', strtolower($content_type));
        if (empty($normalized_input)) return null;

        $all_templates = $wpdb->get_results("SELECT * FROM $table_name WHERE content_type != '' AND content_type IS NOT NULL AND (status = 'publish' OR status IS NULL OR status = '') ORDER BY priority DESC, id DESC"); // phpcs:ignore

        
        foreach ($all_templates as $template) {
            $t_slug = str_replace(' ', '_', strtolower(trim((string)$template->content_type)));
            if (!empty($t_slug) && $t_slug === $normalized_input) {
                return $template;
            }
        }

        return null;
    }

    private function send_email_for_type($order_id, $content_type, $default_subject = '', $to_admin = false, $extra_replacements = [], $force = false) {
        $order = wc_get_order($order_id);
        // error_log('order_id: ' . $order_id);
        // error_log('content_type: ' . $content_type);
        // error_log('default_subject: ' . $default_subject);
        // error_log('to_admin: ' . $to_admin);
        // error_log('extra_replacements: ' . print_r($extra_replacements, true));
        // error_log('force: ' . $force);
        if (!$order && $order_id > 0 && strpos($content_type, 'new_user') === false && strpos($content_type, 'reset_password') === false && strpos($content_type, 'password_reset') === false) {
            return;
        }

        // --- Prevent Duplicate Emails (unless forced) ---
        $sent_key = '_wetc_sent_' . $content_type;
        if ($order_id > 0 && !$force) {
            if ($order instanceof \WC_Order) {
                if ($order->get_meta($sent_key)) return;
            } else {
                if (get_user_meta($order_id, $sent_key, true)) return;
            }
        }
        
        $template = $this->get_active_template_for_type($content_type);
        if (!$template || empty($content_type)) {
            return; // Exit if no valid template found
        }

        // Only mark as sent if template found and we have a valid key
        if ($order_id > 0 && !empty($sent_key)) {
            if ($order instanceof \WC_Order) {
                $order->update_meta_data($sent_key, 'yes');
                $order->save();
            } else {
                update_user_meta($order_id, $sent_key, 'yes');
            }
        }

        $template_id = intval($template->id);
        
        // Use template title as subject
        $subject = !empty($template->email_template_name) ? $template->email_template_name : $default_subject;
        $html_content = !empty($template->html_content) ? stripslashes($template->html_content) : '';

        if (empty($html_content)) {
            // error_log("WETC: Template $template_id has no content.");
            return;
        }

        // Settings for styles (optional, can be deprecated if HTML has inline styles)
        $settings = !empty($template->settings) ? json_decode($template->settings, true) : [];
        $header_color = esc_attr($settings['header_color'] ?? '#F44336'); 
        $footer_color = esc_attr($settings['footer_color'] ?? '#333333'); 
        $font = esc_attr($settings['font'] ?? 'Poppins'); 

        // Replacements
        $body = self::replace_email_placeholders($html_content, $order_id, $order, $header_color, $footer_color, $font, $template_id, $extra_replacements);

        // Subject Replacements
        $subject = self::replace_email_placeholders($subject, $order_id, $order, $header_color, $footer_color, $font, $template_id, $extra_replacements);

        // Recipient
        if ($to_admin) {
            $to = get_option('admin_email');
            // Check if template has specific recipient override?
            if (!empty($template->recipient) && is_email($template->recipient)) {
                 $to = $template->recipient;
            }
        } else {
            if ($order instanceof \WC_Order) {
                $to = $order->get_billing_email();
            } else {
                $user = get_userdata($order_id);
                $to = $user ? $user->user_email : '';
            }
        }

        // Send Email
        if (empty($to)) {
            // error_log("WETC: No recipient found for $content_type (ID: $order_id)");
            return $body;
        }

        // Insert log row FIRST so we get a unique log_id to embed in the tracking pixel.
        // This guarantees the tracker always updates the correct single row.
        $log_id = $this->log_email($order_id, $template_id, $to, $subject, 'pending');

        // Tracking Pixel — use log_id for precise per-email tracking.
        // No display:none so email clients don't skip loading it.
        $tracking_url = add_query_arg(
            [
                'email-tracker' => '1',
                'log_id'        => intval($log_id),
            ],
            site_url('/')
        );
        $tracking_pixel = '<img src="' . esc_url($tracking_url) . '" width="1" height="1" alt="" border="0" style="height:1px!important;width:1px!important;border-width:0!important;margin-top:0!important;margin-bottom:0!important;margin-right:0!important;margin-left:0!important;padding-top:0!important;padding-bottom:0!important;padding-right:0!important;padding-left:0!important;" />';

        if (stripos($body, '</body>') !== false) {
            $body = str_ireplace('</body>', $tracking_pixel . '</body>', $body);
        } else {
            $body .= $tracking_pixel;
        }

        $from_name = get_option('woocommerce_email_from_name', get_bloginfo('name'));
        $from_address = get_option('woocommerce_email_from_address', get_option('admin_email'));
        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . esc_attr($from_name) . ' <' . sanitize_email($from_address) . '>',
            'Reply-To: ' . esc_attr($from_name) . ' <' . sanitize_email($from_address) . '>'
        ];
        $sent = wp_mail($to, $subject, $body, $headers);

        if ($sent) {
            $this->log_analytics($template_id);
            // Update the pre-inserted log row to 'success'
            if ($log_id) {
                global $wpdb;
                $wpdb->update( // phpcs:ignore
                    $wpdb->prefix . 'woo_email_logs',
                    ['status' => 'success'],
                    ['id'     => $log_id]
                );
            }
        } else {
            // Update the pre-inserted log row to 'failed'
            if ($log_id) {
                global $wpdb;
                $wpdb->update( // phpcs:ignore
                    $wpdb->prefix . 'woo_email_logs',
                    ['status' => 'failed', 'error_message' => 'WP Mail returned false'],
                    ['id'     => $log_id]
                );
            }
        }

        return $body;
    }

    private function log_analytics($template_id) {
        global $wpdb;
        $date = current_time('Y-m-d');
        $table_analytics = $wpdb->prefix . 'woo_email_analytics';
        
        $existing = $wpdb->get_row($wpdb->prepare( // phpcs:ignore
            "SELECT * FROM $table_analytics WHERE template_id = %d AND date_recorded = %s", // phpcs:ignore
            $template_id, $date
        ));

        if ($existing) {
            $wpdb->update($table_analytics,  // phpcs:ignore
                ['emails_sent' => $existing->emails_sent + 1], 
                ['id' => $existing->id]
            );
        } else {
            $wpdb->insert($table_analytics, [ // phpcs:ignore
                'template_id' => $template_id,
                'emails_sent' => 1,
                'emails_opened' => 0,
                'emails_clicked' => 0,
                'date_recorded' => $date
            ]);
        }
    }

    private function log_email($order_id, $template_id, $recipient, $subject, $status, $error_message = null) {
        global $wpdb;
        $table_logs = $wpdb->prefix . 'woo_email_logs';
        
        $wpdb->insert($table_logs, [ // phpcs:ignore 
            'order_id'      => $order_id > 0 ? $order_id : null,
            'template_id'   => $template_id > 0 ? $template_id : null,
            'recipient'     => $recipient,
            'subject'       => $subject,
            'status'        => $status,
            'error_message' => $error_message,
            'is_opened'     => 0,
            'created_at'    => current_time('mysql')
        ]);

        return $wpdb->insert_id; // Return the new log row ID
    }

    public static function replace_email_placeholders($body, $order_id, $order, $header_color, $footer_color, $font, $template_id = 0, $extra_replacements = []) {
        
        // --- Helper to always return empty if value is missing ---
        $safe_replace = function($placeholder, $value) {
            if ($value === null || $value === '') {
                return ''; 
            }
            return $value;
        };

        // --- 1. Order / User Details ---
        $customer_name = "";
        $total_order = "";
        $order_url = "";
        $subtotal = "";
        $payment_method = "";
        $admin_order_url = "";
        $billing_name = "";
        $billing_address_1 = "";
        $billing_address_2 = "";
        $billing_city = "";
        $billing_country = "";
        $billing_phone = "";
        $billing_email = "";
        $shipping_name = "";
        $shipping_address_1 = "";
        $shipping_address_2 = "";
        $shipping_city = "";
        $shipping_country = "";
        $shipping_phone = "";
        $shipping_email = "";
        $order_items_rows = "";
        $order_items_rows_with_images = "";
        $order_date = "";
        $shipping_method = "";
        $combined_discount = 0;
        $coupon_discount = 0;
        $total_sale_discount = 0;
        $tax_amount = "";
        $order_shipping = "";
        $related_products_data = [];
        $customer_note = "";
        $order_totals_table = "";
        $user_login = "";
        $reset_link = "";

        // --- Store Details ---
        $store_name = get_bloginfo('name');
        $store_address = WC()->countries->get_base_address();
        $store_email = get_option('admin_email');
        $store_phone = get_option('woocommerce_store_phone', ''); 
        $store_tagline = get_bloginfo('description');
        $logo_url = get_theme_mod('custom_logo') ? wp_get_attachment_image_src(get_theme_mod('custom_logo'), 'full')[0] : '';
        $contact_url = esc_url(get_option('contact_page_url'));

        if ($order instanceof \WC_Order) {
            $customer_name = $order->get_billing_first_name();
            $total_order = wc_price($order->get_total());
            $order_url_raw = esc_url($order->get_view_order_url());
            $order_url = $order_url_raw;
            if ($template_id > 0) {
                 $order_url = add_query_arg(['email-click' => 1, 'order_id' => $order_id, 'template_id' => $template_id, 'redirect_to' => $order_url_raw], site_url('/'));
            }
            $subtotal = wc_price($order->get_subtotal());
            $payment_method = $order->get_payment_method_title();
            $admin_order_url_raw = admin_url('post.php?post=' . $order_id . '&action=edit');
            $admin_order_url = $admin_order_url_raw;
            if ($template_id > 0) {
                 $admin_order_url = add_query_arg(['email-click' => 1, 'order_id' => $order_id, 'template_id' => $template_id, 'redirect_to' => $admin_order_url_raw], site_url('/'));
            }
            $billing_name = $order->get_formatted_billing_full_name();
            $billing_address_1 = $order->get_billing_address_1();
            $billing_address_2 = $order->get_billing_address_2();
            $billing_city = $order->get_billing_city();
            $billing_country = $order->get_billing_country();
            $billing_phone = $order->get_billing_phone();
            $billing_email = $order->get_billing_email();
            $shipping_name = $order->get_formatted_shipping_full_name();
            $shipping_address_1 = $order->get_shipping_address_1();
            $shipping_address_2 = $order->get_shipping_address_2();
            $shipping_city = $order->get_shipping_city();
            $shipping_country = $order->get_shipping_country();
            $shipping_phone = $order->get_shipping_phone();
            $shipping_email = $billing_email;
            $order_date = $order->get_date_created() ? $order->get_date_created()->date('Y-m-d') : '';
            $shipping_method = $order->get_shipping_method();
            $tax_amount = wc_price($order->get_total_tax());
            $order_shipping = wc_price($order->get_shipping_total());
            $coupon_discount = $order->get_total_discount();
            $coupon_discount = $order->get_total_discount();
            $customer_note = $order->get_customer_note();
            $user_id = $order->get_user_id();
            $user = $user_id ? get_userdata($user_id) : null;
            $user_login = $user ? $user->user_login : '';
            $reset_link = wp_lostpassword_url();

            // Additional Billing Details
            $billing_first_name = $order->get_billing_first_name();
            $billing_last_name  = $order->get_billing_last_name();
            $billing_state      = $order->get_billing_state();
            $billing_postcode   = $order->get_billing_postcode();

            // Additional Shipping Details
            $shipping_first_name = $order->get_shipping_first_name();
            $shipping_last_name  = $order->get_shipping_last_name();
            $shipping_state      = $order->get_shipping_state();
            $shipping_postcode   = $order->get_shipping_postcode();
            
            // Refund Details (Global Calculation)
            $refund_amount = wc_price($order->get_total_refunded());
            $refund_reason = '';
            $total_refunded = $order->get_total_refunded();
            if ($total_refunded > 0) {
                 $refunds = $order->get_refunds();
                 if (!empty($refunds)) {
                     $latest_refund = reset($refunds);
                     $refund_reason = $latest_refund->get_reason() ?: 'Not specified';
                 }
            }
            // Initialize default styles for order items
            $item_row_style = '';
            $item_product_style = 'padding: 10px; text-align: left;';
            $item_quantity_style = 'padding: 10px; text-align: center; width: 50px; white-space: nowrap;';
            $item_price_style = 'padding: 10px; text-align: right; width: 100px; white-space: nowrap;';
            $refund_border_color = '';

            // Initialize productDetails widget style variables (used in table placeholder replacement)
            $pd_table_style       = '';
            $pd_th_product_style  = '';
            $pd_th_quantity_style = '';
            $pd_th_price_style    = '';
            $pd_img_th_style      = '';
            $pd_img_cell_style    = '';
            $pd_product_header    = 'Product';
            $pd_qty_header        = 'Quantity';
            $pd_price_header      = 'Price';


            if ($template_id > 0) {
                global $wpdb;
                $table_name = $wpdb->prefix . 'wetc_email_templates';
                $template_row = $wpdb->get_row($wpdb->prepare("SELECT json_data FROM $table_name WHERE id = %d", $template_id));
                if ($template_row && !empty($template_row->json_data)) {
                    $json_data = json_decode($template_row->json_data, true);
                    if (is_array($json_data)) {
                        // Locate orderItems widget for row/cell styles
                        $order_items_widget = self::wetc_find_block_by_content_type($json_data, 'orderItems');
                        if ($order_items_widget && isset($order_items_widget['widgetContents'])) {
                            foreach ($order_items_widget['widgetContents'] as $w) {
                                if (isset($w['contentType']) && $w['contentType'] === 'orderItems' && !empty($w['contentData'])) {
                                    $c_data = json_decode($w['contentData'], true);
                                    if (is_array($c_data) && isset($c_data['subStyles'])) {
                                        $sub = $c_data['subStyles'];
                                        if (!empty($sub['item_row'])) {
                                            $item_row_style = self::wetc_to_css_string($sub['item_row']);
                                        }
                                        if (!empty($sub['item_product'])) {
                                            $item_product_style = self::wetc_to_css_string($sub['item_product']);
                                            if (strpos($item_product_style, 'text-align') === false) {
                                                $item_product_style .= '; text-align: left;';
                                            }
                                        }
                                        if (!empty($sub['item_quantity'])) {
                                            $item_quantity_style = self::wetc_to_css_string($sub['item_quantity']);
                                            if (strpos($item_quantity_style, 'text-align') === false) {
                                                $item_quantity_style .= '; text-align: center;';
                                            }
                                        }
                                        if (!empty($sub['item_price'])) {
                                            $item_price_style = self::wetc_to_css_string($sub['item_price']);
                                            if (strpos($item_price_style, 'text-align') === false) {
                                                $item_price_style .= '; text-align: right;';
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Locate productDetails widget for border/header styles (when orderItems is not present)
                        $product_details_widget = self::wetc_find_block_by_content_type($json_data, 'productDetails');
                        if ($product_details_widget && isset($product_details_widget['widgetContents'])) {
                            foreach ($product_details_widget['widgetContents'] as $pw) {
                                if (isset($pw['contentType']) && $pw['contentType'] === 'productDetails' && !empty($pw['contentData'])) {
                                    $pd = json_decode($pw['contentData'], true);
                                    if (is_array($pd)) {
                                        $pd_border_color   = !empty($pd['borderColor']) ? $pd['borderColor'] : '#eeeeee';
                                        $pd_border_width   = isset($pd['borderWidth']) ? intval($pd['borderWidth']) : 1;
                                        $pd_border_style   = !empty($pd['borderStyle']) ? $pd['borderStyle'] : 'solid';
                                        $pd_header_bg      = !empty($pd['headerBackgroundColor']) ? $pd['headerBackgroundColor'] : '#f8f9fa';
                                        $pd_header_color   = !empty($pd['headerTextColor']) ? $pd['headerTextColor'] : '#333333';
                                        $pd_font_family    = !empty($pd['fontFamily']) ? $pd['fontFamily'] : 'inherit';
                                        $pd_font_size      = !empty($pd['fontSize']) ? intval($pd['fontSize']) . 'px' : '14px';
                                        $pd_text_color     = !empty($pd['textColor']) ? $pd['textColor'] : '#333333';
                                        $pd_table_bg       = !empty($pd['backgroundColor']) ? $pd['backgroundColor'] : '#ffffff';
                                        $pd_text_align     = !empty($pd['textAlign']) ? $pd['textAlign'] : 'left';
                                        $pd_show_image     = isset($pd['showImage']) ? (bool)$pd['showImage'] : true;
                                        $pd_product_header = !empty($pd['productHeader']) ? $pd['productHeader'] : 'Product';
                                        $pd_qty_header     = !empty($pd['quantityHeader']) ? $pd['quantityHeader'] : 'Quantity';
                                        $pd_price_header   = !empty($pd['priceHeader']) ? $pd['priceHeader'] : 'Price';

                                        $pd_border = "{$pd_border_width}px {$pd_border_style} {$pd_border_color}";
                                        $pd_th_style = "border: {$pd_border}; padding: 10px 12px; text-align: {$pd_text_align}; background-color: {$pd_header_bg}; color: {$pd_header_color}; font-family: {$pd_font_family}; font-size: {$pd_font_size}; font-weight: bold; white-space: nowrap;";
                                        $pd_td_style = "border: {$pd_border}; padding: 10px 12px; font-family: {$pd_font_family}; font-size: {$pd_font_size}; color: {$pd_text_color};";

                                        $item_product_style  = $pd_td_style . ' text-align: left;';
                                        $item_quantity_style = $pd_td_style . ' text-align: center; width: 80px; white-space: nowrap;';
                                        $item_price_style    = $pd_td_style . ' text-align: right; width: 100px; white-space: nowrap;';

                                        // Store for use in table header generation
                                        $pd_th_product_style  = $pd_th_style . ' text-align: left;';
                                        $pd_th_quantity_style = $pd_th_style . ' text-align: center; width: 80px;';
                                        $pd_th_price_style    = $pd_th_style . ' text-align: right; width: 100px;';
                                        $pd_table_style       = "width: 100%; border-collapse: collapse; background-color: {$pd_table_bg};";
                                        $pd_img_cell_style    = $pd_td_style . ' text-align: center; width: 60px;';
                                        $pd_img_th_style      = $pd_th_style . ' text-align: center; width: 60px;';
                                    }
                                }
                            }
                        }

                        // Locate refundPartial widget for border color styling
                        $refund_partial_widget = self::wetc_find_block_by_content_type($json_data, 'refundPartial');
                        if ($refund_partial_widget && isset($refund_partial_widget['refundPartialEditorOptions'])) {
                            $opts = $refund_partial_widget['refundPartialEditorOptions'];
                            if (!empty($opts['borderColor'])) {
                                $refund_border_color = $opts['borderColor'];
                            }
                        }
                    }
                }
            }

            // Items breakdown
            $items = $order->get_items();
            foreach ($items as $item_id => $item) {
                $product_name = $item->get_name();
                $quantity = $item->get_quantity();
                $product = $item->get_product();
                $item_subtotal = $item->get_subtotal();
                $regular_price = $product ? (float)$product->get_regular_price() : 0;
                $line_regular_total = $regular_price > 0 ? $regular_price * $quantity : $item_subtotal;
                if ($line_regular_total > $item_subtotal) {
                    $total_sale_discount += ($line_regular_total - $item_subtotal);
                }
                $img_cell_html = '';
                $product = $item->get_product();
                
                // Determine Image Cell Content
                if ($product) {
                    $img_id = $product->get_image_id();
                    $img_src = '';
                    if ($img_id) {
                         $img_src_data = wp_get_attachment_image_src($img_id, 'thumbnail');
                         $img_src = $img_src_data ? $img_src_data[0] : '';
                    }
                    if (empty($img_src)) {
                         $img_src = wc_placeholder_img_src();
                    }

                    // Check if localhost/127.0.0.1 to prevent broken image icon in external emails
                    $is_local = (strpos($img_src, 'localhost') !== false || strpos($img_src, '127.0.0.1') !== false);
                    
                    if (!empty($img_src)) {
                        $img_td_style = !empty($pd_img_cell_style)
                            ? $pd_img_cell_style . ' vertical-align: middle;'
                            : 'padding: 10px; border: 1px solid #ddd; width: 60px; text-align: center; vertical-align: middle;';
                        $img_cell_html = '<td style="' . esc_attr($img_td_style) . '"><img src="' . esc_url($img_src) . '" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; display: inline-block;" /></td>';
                    }
                }
                
                $order_items_rows .= "<tr style='{$item_row_style}'>
                        <td style='{$item_product_style}'>$product_name</td>
                        <td style='{$item_quantity_style}'>$quantity</td>
                        <td style='{$item_price_style}'>" . wc_price($line_regular_total) . "</td>
                    </tr>";
                
                /*
                 * Logic:
                 * 1. If we have a valid image (and not localhost), yield standard 4-column row.
                 * 2. If no image or localhost image (which breaks), yield 3-column row where Product Name spans 2 cols.
                 *    This satisfies "don't show empty image" and "don't show placeholder" and "empty cell is not correct".
                 */
                if (!empty($img_cell_html)) {
                    $order_items_rows_with_images .= "<tr style='{$item_row_style}'>
                            $img_cell_html
                            <td style='{$item_product_style}'>$product_name</td>
                            <td style='{$item_quantity_style}'>$quantity</td>
                            <td style='{$item_price_style}'>" . wc_price($line_regular_total) . "</td>
                        </tr>";
                } else {
                    $order_items_rows_with_images .= "<tr style='{$item_row_style}'>
                            <td colspan='2' style='{$item_product_style}'>$product_name</td>
                            <td style='{$item_quantity_style}'>$quantity</td>
                            <td style='{$item_price_style}'>" . wc_price($line_regular_total) . "</td>
                        </tr>";
                }
            }
            $combined_discount = $coupon_discount + $total_sale_discount;
            $subtotal_val = (float)$order->get_subtotal() + $total_sale_discount;
            $subtotal = wc_price($subtotal_val);

            // Related Products
            $first_item = reset($items);
            if ($first_item) {
                $product_id = $first_item->get_product_id();
                if ($product_id) {
                    $related_ids = wc_get_related_products($product_id, 4);
                    foreach ($related_ids as $idx => $r_id) {
                        $p = wc_get_product($r_id);
                        if ($p) {
                            $i = $idx + 1;
                            $img_id = $p->get_image_id();
                            $img_url = $img_id ? wp_get_attachment_image_src($img_id, 'medium')[0] : wc_placeholder_img_src();
                            $related_products_data["{{product_name_$i}}"] = $p->get_name();
                            $related_products_data["{{product_price_$i}}"] = $p->get_price_html();
                            $related_products_data["{{product_image_$i}}"] = $img_url;
                            $related_products_data["{{product_url_$i}}"] = $p->get_permalink();
                        }
                    }
                }
            }

            // Add Totals Breakdown
            if ($total_sale_discount > 0) {
                $order_items_rows .= "<tr>
                    <td colspan='2' style='padding: 10px; border: 1px solid #ddd; font-weight: bold;'>Sale Discount:</td>
                    <td style='padding: 10px; border: 1px solid #ddd; color: #e53e3e;'>-" . wc_price($total_sale_discount) . "</td>
                </tr>";
            }

            if ($coupon_discount > 0) {
                $order_items_rows .= "<tr>
                    <td colspan='2' style='padding: 10px; border: 1px solid #ddd; font-weight: bold;'>Coupon Savings:</td>
                    <td style='padding: 10px; border: 1px solid #ddd; color: #e53e3e;'>-" . wc_price($coupon_discount) . "</td>
                </tr>";
            }

            // Generate Order Totals Table
            if (method_exists($order, 'get_order_item_totals')) {
                $order_totals = $order->get_order_item_totals();
                if ($order_totals) {
                    $order_totals_table = '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">';
                    foreach ($order_totals as $total) {
                        $order_totals_table .= '<tr>';
                        $order_totals_table .= '<td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; text-align: left; font-size: 14px;">' . $total['label'] . '</td>';
                        $order_totals_table .= '<td style="padding: 10px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px; font-weight: bold;">' . $total['value'] . '</td>';
                        $order_totals_table .= '</tr>';
                    }
                    $order_totals_table .= '</table>';
                }
            }
        } elseif ($order_id > 0) {
            // Might be a user ID for registration
            $user = get_userdata($order_id);
            if ($user) {
                $customer_name = $user->display_name;
                $billing_email = $user->user_email;
                $user_login = $user->user_login;
                $reset_link = wp_lostpassword_url();
            }
        }

        // Clean up hardcoded refund rows and entire refund widgets from templates if the order is not refunded
        if ($order instanceof \WC_Order) {
            $total_refunded = (float) $order->get_total_refunded();
            if (empty($total_refunded) || $total_refunded <= 0) {
                // Remove the entire widget containers
                $body = preg_replace('/<div[^>]*class="[^"]*wetc-refund-full-widget[^"]*"[^>]*>.*?<\/div>/is', '', $body);
                $body = preg_replace('/<div[^>]*class="[^"]*wetc-refund-partial-widget[^"]*"[^>]*>.*?<\/div>/is', '', $body);
                
                // Fallback for individual rows if any remain
                $body = preg_replace('/<tr[^>]*>(?:(?!<\/tr>).)*?Order fully refunded.*?(?:<\/tr>)/is', '', $body);
                $body = preg_replace('/<tr[^>]*>(?:(?!<\/tr>).)*?\{\{refund_amount\}\}.*?(?:<\/tr>)/is', '', $body);
            }
            
            // Clean up discount row if there is no discount OR if we are showing specific coupon/sale discounts
            $combined_discount = (float) $order->get_total_discount();
            if (empty($combined_discount) || $combined_discount <= 0 || 
                ($coupon_discount > 0 && strpos($body, '{{coupon_discount}}') !== false) || 
                ($total_sale_discount > 0 && strpos($body, '{{sale_discount}}') !== false)) {
                $body = preg_replace('/<tr[^>]*>(?:(?!<\/tr>).)*?\{\{order_discount\}\}.*?(?:<\/tr>)/is', '', $body);
            }

            // Clean up coupon discount row if there is no coupon discount
            if (empty($coupon_discount) || $coupon_discount <= 0) {
                $body = preg_replace('/<tr[^>]*>(?:(?!<\/tr>).)*?\{\{coupon_discount\}\}.*?(?:<\/tr>)/is', '', $body);
            }

            // Clean up sale discount row if there is no sale discount
            if (empty($total_sale_discount) || $total_sale_discount <= 0) {
                $body = preg_replace('/<tr[^>]*>(?:(?!<\/tr>).)*?\{\{sale_discount\}\}.*?(?:<\/tr>)/is', '', $body);
            }
            
            // Clean up payment method row if missing
            $payment_method = $order->get_payment_method_title();
            if (empty($payment_method)) {
                $body = preg_replace('/<tr[^>]*>(?:(?!<\/tr>).)*?\{\{payment_method\}\}.*?(?:<\/tr>)/is', '', $body);
            }
            
            // Clean up shipping row if shipping = 0
            $shipping_total_check = (float)$order->get_shipping_total();
            if ($shipping_total_check <= 0) {
                $body = preg_replace('/<tr[^>]*>(?:(?!<\/tr>).)*?\{\{order_shipping\}\}.*?(?:<\/tr>)/is', '', $body);
            }
        }
        
        $set_password_url = '';
        if (strpos($body, '{{set_password_url}}') !== false
            && empty($extra_replacements['{{set_password_url}}'])
            && !empty($user)
            && is_a($user, 'WP_User')
        ) {
            static $cached_reset_keys = [];
            if (!isset($cached_reset_keys[$user->ID])) {
                $key = get_password_reset_key($user);
                if (!is_wp_error($key)) {
                    $cached_reset_keys[$user->ID] = $key;
                }
            }
            if (isset($cached_reset_keys[$user->ID])) {
                $key = $cached_reset_keys[$user->ID];
                $set_password_url = wc_get_endpoint_url('lost-password', '', wc_get_page_permalink('myaccount')) . '?action=newaccount&key=' . rawurlencode($key) . '&login=' . rawurlencode($user->user_login);
            }
        }
        // --- PERFORM REPLACEMENTS ---

        // Standard Placeholders
        $replacements = [
            '{{order_id}}' => ($order instanceof \WC_Order) ? $order->get_order_number() : '',
            '{{order_date}}' => $order_date,
            '{{customer_name}}' => $customer_name,
            '{{order_total}}' => $total_order,
            '{{order_url}}' => $order_url,
            '{{header_color}}' => $header_color,
            '{{footer_color}}' => $footer_color,
            '{{font}}' => $font,
            '{{order_items_rows}}' => $order_items_rows,
            '{{order_items}}' => $order_items_rows, // Alias for compatibility
            '{{order_details_table_basic}}' => '<table style="width: 100%; border-collapse: collapse;"><thead><tr><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th><th style="padding: 10px; border: 1px solid #ddd; text-align: center; width: 50px;">Qty</th><th style="padding: 10px; border: 1px solid #ddd; text-align: right; width: 100px;">Price</th></tr></thead><tbody>' . $order_items_rows . '</tbody></table>',
            '{{order_details_table_with_images}}' => '<table style="width: 100%; border-collapse: collapse;"><thead><tr><th style="padding: 10px; border: 1px solid #ddd; text-align: center; width: 60px;">Image</th><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th><th style="padding: 10px; border: 1px solid #ddd; text-align: center; width: 50px;">Qty</th><th style="padding: 10px; border: 1px solid #ddd; text-align: right; width: 100px;">Price</th></tr></thead><tbody>' . $order_items_rows_with_images . '</tbody></table>',
            
            // New Placeholders Support
            '{{checkout_url}}' => function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : site_url('/checkout'),
            '{{my_account_url}}' => function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : site_url('/my-account'),
            '{{home_url}}' => home_url(),
            '{{order_status}}' => ($order instanceof \WC_Order) ? wc_get_order_status_name($order->get_status()) : '',
            '{{currency}}' => ($order instanceof \WC_Order) ? $order->get_currency() : '',
            '{{transaction_id}}' => ($order instanceof \WC_Order) ? $order->get_transaction_id() : '',
            '{{site_name}}' => get_bloginfo('name'),
            '{{site_url}}' => site_url(),
            '{{admin_email}}' => get_option('admin_email'),
            '{{user_email}}' => $billing_email,
            '{{customer_email}}' => $billing_email,
            '{{order_number}}' => ($order instanceof \WC_Order) ? $order->get_order_number() : '', // Explicitly ensure this matches order_id often but user expects "number"

            '{{order_subtotal}}' => $subtotal,
            '{{order_shipping}}' => $order_shipping,
            '{{order_discount}}' => (string)wc_price($combined_discount),
            '{{coupon_discount}}' => $coupon_discount > 0 ? (string)wc_price($coupon_discount) : '',
            '{{sale_discount}}' => $total_sale_discount > 0 ? (string)wc_price($total_sale_discount) : '',
            '{{tax_amount}}' => $tax_amount,
            '{{billing_name}}' => $billing_name,
            '{{billing_address_1}}' => $billing_address_1,
            '{{billing_address_2}}' => $billing_address_2,
            '{{billing_city}}' => $billing_city,
            '{{billing_country}}' => $billing_country,
            '{{billing_phone}}' => $billing_phone,
            '{{billing_phone}}' => $billing_phone,
            '{{billing_email}}' => $billing_email,
            '{{billing_first_name}}' => $billing_first_name,
            '{{billing_last_name}}' => $billing_last_name,
            '{{billing_state}}' => $billing_state,
            '{{billing_postcode}}' => $billing_postcode,
            '{{shipping_name}}' => $shipping_name,
            '{{shipping_address_1}}' => $shipping_address_1,
            '{{shipping_address_2}}' => $shipping_address_2,
            '{{shipping_city}}' => $shipping_city,
            '{{shipping_country}}' => $shipping_country,
            '{{shipping_country}}' => $shipping_country,
            '{{shipping_phone}}' => $shipping_phone,
            '{{shipping_first_name}}' => $shipping_first_name,
            '{{shipping_last_name}}' => $shipping_last_name,
            '{{shipping_state}}' => $shipping_state,
            '{{shipping_postcode}}' => $shipping_postcode,
            '{{contact_url}}' => (isset($contact_url) ? $contact_url : ''),
            '{{payment_method}}' => $payment_method,
            '{{admin_order_url}}' => $admin_order_url,
            '{{store_name}}' => (isset($store_name) ? $store_name : get_bloginfo('name')),
            '{{store_address}}' => (isset($store_address) ? $store_address : ''),
            '{{store_email}}' => (isset($store_email) ? $store_email : get_option('admin_email')),
            '{{store_phone}}' => (isset($store_phone) ? $store_phone : ''),
            '{{store_tagline}}' => (isset($store_tagline) ? $store_tagline : get_bloginfo('description')),
            '{{logo_url}}' => (isset($logo_url) ? $logo_url : ''),
            '{{current_year}}' => wp_date('Y'),
            '{{site_title}}' => get_bloginfo('name'),
            '{{related_products_title}}' => 'You Might Also Like',
            '{{shop_url}}' => get_home_url(),
            '{{cancellation_date}}' => current_time('Y-m-d'),
            '{{cancellation_reason}}' => ($order instanceof \WC_Order) ? ($order->get_meta('_order_cancellation_reason', true) ?: 'Not specified') : '',
            '{{shipping_method}}' => $shipping_method,
            '{{refund_amount}}' => $refund_amount,
            '{{refund_reason}}' => $refund_reason,
            '{{customer_note}}' => $customer_note,
            '{{order_tracking_url}}' => $order_url, // Standard fallback
            '{{order_tracking_url}}' => $order_url, // Standard fallback
            '{{order_totals_table}}' => $order_totals_table,
            '{{user_login}}' => $user_login,
            '{{reset_link}}' => $reset_link,
            '{{reset_password_url}}' => $reset_link,
            '{{set_password_url}}' => $set_password_url,
            '{{login_url}}' => wp_login_url(),
            '{{order_details_table_basic}}' => (function() use ($order_items_rows, $pd_th_product_style, $pd_th_quantity_style, $pd_th_price_style, $pd_table_style, $pd_product_header, $pd_qty_header, $pd_price_header) {
                $tbl_style   = !empty($pd_table_style) ? $pd_table_style : 'width: 100%; border-collapse: collapse;';
                $th_product  = !empty($pd_th_product_style) ? $pd_th_product_style : 'text-align:left; padding:8px; border-bottom:1px solid #ddd;';
                $th_qty      = !empty($pd_th_quantity_style) ? $pd_th_quantity_style : 'text-align:center; padding:8px; border-bottom:1px solid #ddd; width: 80px; white-space: nowrap;';
                $th_price    = !empty($pd_th_price_style) ? $pd_th_price_style : 'text-align:right; padding:8px; border-bottom:1px solid #ddd; width: 100px; white-space: nowrap;';
                $lbl_product = !empty($pd_product_header) ? $pd_product_header : 'Product';
                $lbl_qty     = !empty($pd_qty_header) ? $pd_qty_header : 'Qty';
                $lbl_price   = !empty($pd_price_header) ? $pd_price_header : 'Price';
                return '<table style="' . esc_attr($tbl_style) . '"><thead><tr>'
                    . '<th style="' . esc_attr($th_product) . '">' . esc_html($lbl_product) . '</th>'
                    . '<th style="' . esc_attr($th_qty) . '">' . esc_html($lbl_qty) . '</th>'
                    . '<th style="' . esc_attr($th_price) . '">' . esc_html($lbl_price) . '</th>'
                    . '</tr></thead><tbody>' . $order_items_rows . '</tbody></table>';
            })(),
            '{{order_details_table_with_images}}' => (function() use ($order_items_rows_with_images, $pd_th_product_style, $pd_th_quantity_style, $pd_th_price_style, $pd_img_th_style, $pd_table_style, $pd_product_header, $pd_qty_header, $pd_price_header) {
                $tbl_style   = !empty($pd_table_style) ? $pd_table_style : 'width: 100%; border-collapse: collapse;';
                $th_img      = !empty($pd_img_th_style) ? $pd_img_th_style : 'text-align:center; padding:8px; border-bottom:1px solid #ddd; width: 60px; white-space: nowrap;';
                $th_product  = !empty($pd_th_product_style) ? $pd_th_product_style : 'text-align:left; padding:8px; border-bottom:1px solid #ddd;';
                $th_qty      = !empty($pd_th_quantity_style) ? $pd_th_quantity_style : 'text-align:center; padding:8px; border-bottom:1px solid #ddd; width: 80px; white-space: nowrap;';
                $th_price    = !empty($pd_th_price_style) ? $pd_th_price_style : 'text-align:right; padding:8px; border-bottom:1px solid #ddd; width: 100px; white-space: nowrap;';
                $lbl_product = !empty($pd_product_header) ? $pd_product_header : 'Product';
                $lbl_qty     = !empty($pd_qty_header) ? $pd_qty_header : 'Qty';
                $lbl_price   = !empty($pd_price_header) ? $pd_price_header : 'Price';
                return '<table style="' . esc_attr($tbl_style) . '"><thead><tr>'
                    . '<th style="' . esc_attr($th_img) . '">Image</th>'
                    . '<th style="' . esc_attr($th_product) . '">' . esc_html($lbl_product) . '</th>'
                    . '<th style="' . esc_attr($th_qty) . '">' . esc_html($lbl_qty) . '</th>'
                    . '<th style="' . esc_attr($th_price) . '">' . esc_html($lbl_price) . '</th>'
                    . '</tr></thead><tbody>' . $order_items_rows_with_images . '</tbody></table>';
            })(),
            '{{tax_rate}}' => ($order instanceof \WC_Order) ? (function($order) {
                $taxes = $order->get_taxes();
                foreach ($taxes as $tax) {
                    $rate_id = $tax->get_rate_id();
                    return \WC_Tax::get_rate_percent_value($rate_id) . '%';
                }
                return '0%';
            })($order) : '',
            
            // Additional Common Aliases
            '{{order_tax}}' => $tax_amount,
            '{{order_date_time}}' => ($order instanceof \WC_Order && $order->get_date_created()) ? $order->get_date_created()->date('Y-m-d H:i:s') : '',
            '{{first_name}}' => $customer_name,
            '{{last_name}}' => ($order instanceof \WC_Order) ? $order->get_billing_last_name() : '',
            '{{customer_first_name}}' => $customer_name,
            '{{customer_last_name}}' => ($order instanceof \WC_Order) ? $order->get_billing_last_name() : '',
            '{{order_received_url}}' => ($order instanceof \WC_Order) ? $order->get_checkout_order_received_url() : '',
            '{{order_note}}' => $customer_note,
            '{{order_notes}}' => $customer_note,
        ];
        
        // Add shipping email if available (custom field?) or reuse billing
         $replacements['{{shipping_email}}'] = $billing_email;

        // Extra missing placeholders
        $replacements['{{refund_date}}'] = ($order instanceof \WC_Order && $order->get_total_refunded() > 0)
            ? current_time('Y-m-d') : '';
        $replacements['{{tax_billing}}'] = $tax_amount;
        $replacements['{{order_created_date}}'] = $order_date;
        $replacements['{{order_modified_date}}'] = ($order instanceof \WC_Order && $order->get_date_modified())
            ? $order->get_date_modified()->date('Y-m-d') : $order_date;
        $replacements['{{shipping_method_title}}'] = $shipping_method;

        if (!empty($refund_border_color) && isset($extra_replacements['{{refunded_items_table}}'])) {
            $extra_replacements['{{refunded_items_table}}'] = str_replace('#eeeeee', $refund_border_color, $extra_replacements['{{refunded_items_table}}']);
        }

        // Merge related products replacements and extra replacements
        $replacements = array_merge($replacements, $related_products_data, $extra_replacements);

        // Execute Replacements
        foreach ($replacements as $placeholder => $value) {
            // Process placeholders if they exist in the body
            if (strpos($body, $placeholder) !== false) {
                 $replacement_value = $safe_replace($placeholder, $value);
                 $body = str_replace($placeholder, $replacement_value, $body);
            }

            // Handle HTML Entity encoded versions
            $encoded_placeholder = str_replace(['{', '}'], ['&#123;', '&#125;'], $placeholder);
            if (strpos($body, $encoded_placeholder) !== false) {
                 $replacement_value = $safe_replace($placeholder, $value);
                 $body = str_replace($encoded_placeholder, $replacement_value, $body);
            }
        }

        // Cleanup table rows that contain un-replaced product placeholders (e.g. from custom widgets)
        // This ensures that if a product is missing, its entire row (including hardcoded quantity cells) is removed.
        $body = preg_replace('/<tr[^>]*>(?:(?!<\/tr>).)*?\{\{product_name_[0-9]+\}\}(?:(?!<\/tr>).)*?<\/tr>/is', '', $body);

        // Final cleanup for any remaining placeholders (e.g. ones without data or not found in replacements)
        // This includes both literal {{tag}} and HTML entity encoded versions
        $body = preg_replace('/\{\{[a-zA-Z0-9_-]+\}\}/', '', $body);
        $body = preg_replace('/(&#123;){2}[a-zA-Z0-9_-]+(&#125;){2}/', '', $body);

        // Fix line-height: 1.5px and missing semicolons in style declarations
        $body = preg_replace('/line-height:\s*([0-2](?:\.[0-9]+)?)\s*(?:px|PX)/i', 'line-height: $1', $body);
        $body = preg_replace('/text-overflow:\s*clip\s+([a-zA-Z])/i', 'text-overflow: clip; $1', $body);

        // Fix collapsed email container width
        $body = str_replace(
            '<div class="email-container" style="max-width: 600px;',
            '<div class="email-container" style="width: 100%; max-width: 600px;',
            $body
        );

        // Force no-wrap on Quantity and Price column headers to prevent awkward wrapping
        $body = preg_replace_callback('/<th\s+[^>]*style=["\']([^"\']*)["\'][^>]*>\s*(Quantity|Qty|Price|Amount)\s*<\/th>/i', function($matches) {
            $style = $matches[1];
            if (strpos($style, 'white-space') !== false) {
                $style = preg_replace('/white-space\s*:\s*[^;]+;?/i', 'white-space: nowrap !important;', $style);
            } else {
                $style .= '; white-space: nowrap !important;';
            }
            return str_replace($matches[1], $style, $matches[0]);
        }, $body);

        return $body;
    }



//processing order to admin
  
//processing order to admin
public function processing_order_admin($order_id, $force = false) {
    static $already_sent = [];
    if (isset($already_sent[$order_id]) && !$force) return;
    $already_sent[$order_id] = true;

    $this->send_email_for_type($order_id, 'processing_order_admin', 'New Customer Order - Processing', true, [], $force);
}


//processing order to customer

//processing order to customer
public function processing_order_email($order_id, $force = false) {
    static $already_sent = [];
    if (isset($already_sent[$order_id]) && !$force) return;
    $already_sent[$order_id] = true;

    $this->send_email_for_type($order_id, 'processing_order_customer', 'Your Order is Processing', false, [], $force);
}




//Failed Order customer
public function failed_order_email($order_id, $force = false) {
    static $already_sent = [];
    if (isset($already_sent[$order_id]) && !$force) return;
    $already_sent[$order_id] = true;

    $this->send_email_for_type($order_id, 'failed_order_customer', 'Order Failed', false, [], $force);
}

public function failed_order_email_admin($order_id, $force = false) {
    static $already_sent = [];
    if (isset($already_sent[$order_id]) && !$force) return;
    $already_sent[$order_id] = true;

    $this->send_email_for_type($order_id, 'failed_order_admin', 'Order Failed (Admin)', true, [], $force);
}


//refunded customer
public function refunded_order_email($order_id, $refund_id = null, $force = false) {
    static $already_sent = [];
    $cache_key = $order_id . '_' . $refund_id;
    if (isset($already_sent[$cache_key]) && !$force) return;
    $already_sent[$cache_key] = true;

    $extra = [];
    // ... rest of logic
    if ($refund_id) {
        $refund = wc_get_order($refund_id);
        if ($refund) {
            $refunded_items_html = '';
            foreach ($refund->get_items() as $item_id => $item) {
                $product_name = $item->get_name();
                $refund_total = wc_price(abs($item->get_total()));
                $refunded_items_html .= '<tr>';
                $refunded_items_html .= '<td style="padding: 8px; border: 1px solid #eeeeee;">' . esc_html($product_name) . '</td>';
                $refunded_items_html .= '<td style="padding: 8px; border: 1px solid #eeeeee; text-align: right;">' . $refund_total . '</td>';
                $refunded_items_html .= '</tr>';
            }
            $extra = [
                '{{refund_amount}}' => wc_price($refund->get_amount()),
                '{{refund_reason}}' => $refund->get_reason() ?: 'Not specified',
                '{{refunded_items_table}}' => $refunded_items_html
            ];
        }
    }

    $order = wc_get_order($order_id);
    $type = 'refunded_order_customer';
    if ($order) {
        // Full refund logic: total refunded is equal to order total
        $is_full = (float)$order->get_total() <= (float)$order->get_total_refunded();
        $specific_type = $is_full ? 'refunded_order_customer_full' : 'refunded_order_customer_partial';
        
        if ($this->get_active_template_for_type($specific_type)) {
            $type = $specific_type;
        }
    }

    $this->send_email_for_type($order_id, $type, 'Order Refunded', false, $extra, $force);
    
    // Also trigger admin email from here to ensure it uses the same data
    $this->refunded_order_email_admin($order_id, $refund_id, $force);
}

//refunded customer admin
public function refunded_order_email_admin($order_id, $refund_id = null, $force = false) {
    static $last_refund_sent = null;
    if ($last_refund_sent === $refund_id && $refund_id !== null && !$force) return;
    $last_refund_sent = $refund_id;

    $extra = [];
    if ($refund_id) {
        $refund = \wc_get_order($refund_id);
        if ($refund) {
            $refunded_items_html = '';
            foreach ($refund->get_items() as $item_id => $item) {
                $product_name = $item->get_name();
                $refund_total = \wc_price(abs($item->get_total()));
                $refunded_items_html .= '<tr>';
                $refunded_items_html .= '<td style="padding: 8px; border: 1px solid #eeeeee;">' . \esc_html($product_name) . '</td>';
                $refunded_items_html .= '<td style="padding: 8px; border: 1px solid #eeeeee; text-align: right;">' . $refund_total . '</td>';
                $refunded_items_html .= '</tr>';
            }
            $extra = [
                '{{refund_amount}}' => \wc_price($refund->get_amount()),
                '{{refund_reason}}' => $refund->get_reason() ?: 'Not specified',
                '{{refunded_items_table}}' => $refunded_items_html
            ];
        }
    }
    $this->send_email_for_type($order_id, 'refunded_order_admin', 'Order Refunded (Admin)', true, $extra, $force);
}

//cancelled_order
public function cancelled_order_email($order_id, $force = false) {
    static $already_sent = [];
    if (isset($already_sent[$order_id]) && !$force) return;
    $already_sent[$order_id] = true;

    $this->send_email_for_type($order_id, 'cancelled_order_customer', 'Order Cancelled', false, [], $force);
}

public function cancelled_order_email_admin($order_id, $force = false) {
    static $already_sent = [];
    if (isset($already_sent[$order_id]) && !$force) return;
    $already_sent[$order_id] = true;

    $this->send_email_for_type($order_id, 'cancelled_order_admin', 'Order Cancelled (Admin)', true, [], $force);
}


// Cancelled Order Admin Email
//On Hold
//On hold Order customer
public function on_hold_order_email($order_id, $force = false) {
    // PREVENT DOUBLE EMAILS
    static $already_sent_onhold = [];
    if (isset($already_sent_onhold[$order_id]) && !$force) {
        return;
    }
    $already_sent_onhold[$order_id] = true;

    $this->send_email_for_type($order_id, 'on_hold_order', 'Order On Hold', false, [], $force);
}

//Completed Order Template

public function completed_order_email($order_id, $force = false) {
    static $already_sent = [];
    if (isset($already_sent[$order_id]) && !$force) return;
    $already_sent[$order_id] = true;

    $this->send_email_for_type($order_id, 'completed_order_customer', 'Your Order is Complete', false, [], $force);
}

//new order admin email

public function new_order_admin_email($order_id, $force = false) {
    // PREVENT DOUBLE ADMIN EMAILS in same request/order
    static $already_sent = [];
    if (isset($already_sent[$order_id]) && !$force) {
        return;
    }
    $already_sent[$order_id] = true;

    $this->send_email_for_type($order_id, 'new_order_admin', 'New Customer Order', true, [], $force);
}


//abandoned_cart_email 

public function abandoned_cart_email($order_id, $force = false) {
    static $already_sent = [];
    if (isset($already_sent[$order_id]) && !$force) return;
    $already_sent[$order_id] = true;

    $order = wc_get_order($order_id);
    if (!$order) {
        // error_log("Invalid order ID: $order_id");
        return;
    }
    $cart_url = wc_get_cart_url(); // Use WC function for cart URL
    $extra_replacements = [
        '{{cart_url}}' => esc_url($cart_url),
    ];
    
    $this->send_email_for_type($order_id, 'abandoned_cart', 'You left something in your cart', false, $extra_replacements);
}

//new_user_registration_email customer

//new_user_registration_email customer
public function new_user_registration_email($user_id, $force = false) {
    static $already_sent = [];
    if (isset($already_sent[$user_id]) && !$force) return;
    $already_sent[$user_id] = true;

    $extra = [];
    $user  = get_userdata($user_id);
    if ($user) {
        $reset_key = get_password_reset_key($user);
        if (!is_wp_error($reset_key)) {
            $extra['{{set_password_url}}'] = wc_get_endpoint_url('lost-password', '', wc_get_page_permalink('myaccount'))
                . '?action=newaccount'
                . '&key='   . rawurlencode($reset_key)
                . '&login=' . rawurlencode($user->user_login);
        }
    }

    $this->send_email_for_type($user_id, 'new_user_registration', 'Welcome to the store!', false, $extra, $force);
}

//new user reg admin

//new user reg admin
public function new_user_registration_email_admin($user_id, $force = false) {
    static $already_sent = [];
    if (isset($already_sent[$user_id]) && !$force) return;
    $already_sent[$user_id] = true;

    $this->send_email_for_type($user_id, 'new_user_registration_admin', 'New User Registered', true, [], $force);
}


//change
public function customer_note_email($args, $force = false) {
    if (isset($args['order_id']) && isset($args['customer_note'])) {
        $order_id = $args['order_id'];
        static $already_sent = [];
        if (isset($already_sent[$order_id]) && !$force) return;
        $already_sent[$order_id] = true;

        $extra = ['{{customer_note}}' => $args['customer_note']];
        $this->send_email_for_type($order_id, 'customer_note', 'Note Added to Your Order', false, $extra, $force);
    }
}

public function customer_invoice_email($order, $force = false) {
    $order_id = ($order instanceof \WC_Order) ? $order->get_id() : $order;
    
    static $already_sent = [];
    if (isset($already_sent[$order_id]) && !$force) return;
    $already_sent[$order_id] = true;

    $order_obj = ($order instanceof \WC_Order) ? $order : wc_get_order($order_id);
    
    $type = 'customer_invoice';
    if ($order_obj) {
        $specific_type = $order_obj->is_paid() ? 'customer_invoice_paid' : 'customer_invoice_pending';
        if ($this->get_active_template_for_type($specific_type)) {
            $type = $specific_type;
        }
    }

    $this->send_email_for_type($order_id, $type, 'Invoice for Your Order', false, [], $force);
}


//reset password for customer


public function reset_password_email($message, $key, $user_login, $user_data) {
    // For password reset, we don't have an order ID. 
    // We pass 0 and provide user-specific placeholders.
    $reset_url = esc_url(network_site_url("wp-login.php?action=rp&key=$key&login=" . rawurlencode($user_login), 'login'));
    $extra_replacements = [
        '{{user_login}}' => $user_login,
        '{{reset_link}}' => $reset_url,
        '{{reset_password_url}}' => $reset_url,
    ];

    $body = $this->send_email_for_type($user_data->ID, 'reset_password', 'Password Reset Request', false, $extra_replacements, true);
    
    // Return false if our body is successfully sent, preventing duplicate plain-text email from being sent by WordPress
    return !empty($body) ? false : $message;
}

/**
 * Handle WooCommerce-specific password reset notification.
 * WooCommerce's My Account lost password form fires this action 
 * instead of using WordPress core's retrieve_password_message filter.
 * 
 * @param string $user_login The user's login name.
 * @param string $key        The password reset key.
 */
public function woocommerce_reset_password_notification($user_login, $key) {
    error_log('WETC: woocommerce_reset_password_notification triggered for user: ' . $user_login);
    
    $user_data = get_user_by('login', $user_login);
    if (!$user_data) {
        error_log('WETC: User not found for login: ' . $user_login);
        return;
    }

    $reset_url = esc_url(network_site_url("wp-login.php?action=rp&key=$key&login=" . rawurlencode($user_login), 'login'));
    $extra_replacements = [
        '{{user_login}}' => $user_login,
        '{{reset_link}}' => $reset_url,
        '{{reset_password_url}}' => $reset_url,
    ];

    $body = $this->send_email_for_type($user_data->ID, 'reset_password', 'Password Reset Request', false, $extra_replacements, true);

    if (!empty($body)) {
        error_log('WETC: Custom reset password email sent successfully to ' . $user_data->user_email);
        // Remove WooCommerce's default reset password email to prevent duplicate
        $wc_emails = WC()->mailer()->get_emails();
        if (isset($wc_emails['WC_Email_Customer_Reset_Password'])) {
            remove_action('woocommerce_reset_password_notification', array($wc_emails['WC_Email_Customer_Reset_Password'], 'trigger'), 10);
        }
    } else {
        error_log('WETC: Custom reset password email body was empty, falling back to WooCommerce default');
    }
}

//reset password admin

public function reset_password_email_admin($message, $key, $user_login, $user_data) {
    $extra_replacements = [
        '{{user_login}}' => $user_login,
    ];
    $this->send_email_for_type($user_data->ID, 'admin_password_reset', 'Password Reset Request (Admin)', true, $extra_replacements, true);
}

//
public function custom_email_open_tracker() {
    // phpcs:disable WordPress.Security.NonceVerification.Recommended
    if (isset($_GET['email-tracker']) && $_GET['email-tracker'] == '1') {
        global $wpdb;

        $log_id     = isset($_GET['log_id'])     ? intval($_GET['log_id'])     : 0;
        // Legacy fallback for old emails that used order_id + template_id
        $order_id   = isset($_GET['order_id'])   ? intval($_GET['order_id'])   : 0;
        $template_id = isset($_GET['template_id']) ? intval($_GET['template_id']) : 0;

        $table_analytics = $wpdb->prefix . 'woo_email_analytics';
        $table_logs      = $wpdb->prefix . 'woo_email_logs';

        // Resolve log row — prefer log_id (precise), fall back to order_id + template_id
        $log_row = null;
        if ($log_id > 0) {
            $log_row = $wpdb->get_row($wpdb->prepare( // phpcs:ignore
                "SELECT * FROM {$table_logs} WHERE id = %d",
                $log_id
            ));
        }
        if (!$log_row && $template_id > 0) {
            // Legacy: find the most recent matching log row
            if ($order_id > 0) {
                $log_row = $wpdb->get_row($wpdb->prepare( // phpcs:ignore
                    "SELECT * FROM {$table_logs} WHERE order_id = %d AND template_id = %d ORDER BY id DESC LIMIT 1",
                    $order_id, $template_id
                ));
            } else {
                $log_row = $wpdb->get_row($wpdb->prepare( // phpcs:ignore
                    "SELECT * FROM {$table_logs} WHERE template_id = %d AND (order_id IS NULL OR order_id = 0) ORDER BY id DESC LIMIT 1",
                    $template_id
                ));
            }
        }

        if ($log_row && !$log_row->is_opened) {
            $resolved_template_id = intval($log_row->template_id);

            // Mark log as opened
            $wpdb->update( // phpcs:ignore
                $table_logs,
                ['is_opened' => 1],
                ['id'        => $log_row->id]
            );

            // Update analytics
            if ($resolved_template_id > 0) {
                $date     = current_time('Y-m-d');
                $existing = $wpdb->get_row($wpdb->prepare( // phpcs:ignore
                    "SELECT * FROM {$table_analytics} WHERE template_id = %d AND date_recorded = %s",
                    $resolved_template_id, $date
                ));
                if ($existing) {
                    $wpdb->update( // phpcs:ignore
                        $table_analytics,
                        ['emails_opened' => $existing->emails_opened + 1],
                        ['id' => $existing->id]
                    );
                } else {
                    $wpdb->insert( // phpcs:ignore
                        $table_analytics,
                        [
                            'template_id'   => $resolved_template_id,
                            'emails_opened' => 1,
                            'emails_sent'   => 0,
                            'date_recorded' => $date,
                        ]
                    );
                }
            }
        }

        // Output a real 1x1 transparent GIF (raw binary)
        header('Content-Type: image/gif');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        echo base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        exit;
    }
    // phpcs:enable WordPress.Security.NonceVerification.Recommended
    }

    public function custom_email_click_tracker() {
        // phpcs:disable WordPress.Security.NonceVerification.Recommended
        if (isset($_GET['email-click']) && $_GET['email-click'] == '1' && isset($_GET['template_id']) && isset($_GET['order_id']) && isset($_GET['redirect_to'])) { // phpcs:ignore
            global $wpdb;
            $template_id = intval($_GET['template_id']);
            $order_id    = intval($_GET['order_id']);
            $redirect_to = esc_url_raw(sanitize_text_field(wp_unslash($_GET['redirect_to'])));
            $date        = current_time('Y-m-d');
            $table_analytics = $wpdb->prefix . 'woo_email_analytics';
            $table_logs      = $wpdb->prefix . 'woo_email_logs';

            $existing = $wpdb->get_row($wpdb->prepare( // phpcs:ignore
                "SELECT * FROM {$table_analytics} WHERE template_id = %d AND date_recorded = %s",
                $template_id, $date
            ));

            if ($existing) {
                $wpdb->update($table_analytics, ['emails_clicked' => $existing->emails_clicked + 1], ['id' => $existing->id]); // phpcs:ignore
            } else {
                $wpdb->insert($table_analytics, [ // phpcs:ignore
                    'template_id'    => $template_id,
                    'emails_opened'  => 0,
                    'emails_sent'    => 0,
                    'emails_clicked' => 1,
                    'date_recorded'  => $date,
                ]);
            }

            if ($order_id > 0) {
                $wpdb->update($table_logs, ['is_opened' => 1], ['order_id' => $order_id, 'template_id' => $template_id]); // phpcs:ignore
            } else {
                $wpdb->query($wpdb->prepare("UPDATE {$table_logs} SET is_opened = 1 WHERE template_id = %d AND (order_id IS NULL OR order_id = 0)", $template_id)); // phpcs:ignore
            }

            wp_safe_redirect($redirect_to);
            exit;
        }
        // phpcs:enable WordPress.Security.NonceVerification.Recommended
    }

    public function register_tracker_verification_endpoint() {
        register_rest_route('woomailer/v1', '/verify-tracker', [
            'methods'             => 'GET',
            'callback'            => [$this, 'handle_tracker_verification'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function handle_tracker_verification(\WP_REST_Request $request) {
        $stored_key = get_option('wetc_tracker_verify_key', '');
        if (empty($stored_key)) {
            $stored_key = wp_generate_password(32, false);
            update_option('wetc_tracker_verify_key', $stored_key);
        }

        $provided_key = sanitize_text_field($request->get_param('key'));
        if (empty($provided_key) || !hash_equals($stored_key, $provided_key)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Unauthorized. Provide the correct ?key= parameter.',
                'hint'    => 'WP-CLI: wp option get wetc_tracker_verify_key --allow-root',
            ], 403);
        }

        global $wpdb;
        $table_logs = $wpdb->prefix . 'woo_email_logs';
        $log_id     = intval($request->get_param('log_id'));

        if ($log_id > 0) {
            $row = $wpdb->get_row($wpdb->prepare( // phpcs:ignore
                "SELECT id, order_id, template_id, recipient, subject, status, is_opened, created_at FROM {$table_logs} WHERE id = %d",
                $log_id
            ), ARRAY_A);

            if (!$row) {
                return new \WP_REST_Response(['success' => false, 'message' => 'Log not found'], 404);
            }

            $row['is_opened']   = (bool) $row['is_opened'];
            $row['tracker_url'] = add_query_arg(['email-tracker' => '1', 'log_id' => $row['id']], site_url('/'));

            return new \WP_REST_Response(['success' => true, 'log' => $row], 200);
        }

        $rows = $wpdb->get_results( // phpcs:ignore
            "SELECT id, order_id, template_id, recipient, subject, status, is_opened, created_at FROM {$table_logs} ORDER BY id DESC LIMIT 20",
            ARRAY_A
        );

        foreach ($rows as &$row) {
            $row['is_opened']   = (bool) $row['is_opened'];
            $row['tracker_url'] = add_query_arg(['email-tracker' => '1', 'log_id' => $row['id']], site_url('/'));
        }
        unset($row);

        return new \WP_REST_Response([
            'success'     => true,
            'total_shown' => count($rows),
            'logs'        => $rows,
        ], 200);
    }

    public function handle_resend_notification($order, $email_id) {
        $order_id = $order->get_id();
        switch ($email_id) {
            case 'new_order':
                $this->new_order_admin_email($order_id, true);
                break;
            case 'customer_processing_order':
                $this->processing_order_email($order_id, true);
                break;
            case 'customer_completed_order':
                $this->completed_order_email($order_id, true);
                break;
            case 'customer_refunded_order':
                $this->refunded_order_email($order_id, null, true);
                break;
            case 'customer_invoice':
                $this->customer_invoice_email($order_id, true);
                break;
        }
    }

    /**
     * Send a test email using the EXACT production pipeline.
     * Template lookup -> placeholder replacement -> pixel injection -> log -> wp_mail.
     * Only the recipient is overridden to $to.
     *
     * Usage via WP-CLI:
     *   wp eval 'print_r(SmackCoders\WETC\WETC_Email_Handler::get_instance()->send_test_email("you@example.com"));' --allow-root
     *
     * @param string $to           Recipient email.
     * @param string $content_type Template content_type slug (optional).
     * @param int    $order_id     Order ID for placeholders (optional).
     * @return array
     */
    public function send_test_email($to, $content_type = '', $order_id = 0) {
        global $wpdb;

        if (!is_email($to)) {
            return ['success' => false, 'message' => 'Invalid email: ' . $to];
        }

        // 1. Template lookup (same as production)
        $table_name = $wpdb->prefix . 'wetc_email_templates';

        if (!empty($content_type)) {
            $template = $this->get_active_template_for_type($content_type);
        } else {
            $template = $wpdb->get_row( // phpcs:ignore
                "SELECT * FROM {$table_name} WHERE (status = 'publish' OR status IS NULL OR status = '') AND html_content != '' AND html_content IS NOT NULL ORDER BY priority DESC, id DESC LIMIT 1"
            );
        }

        if (!$template || empty($template->html_content)) {
            $available = $wpdb->get_col("SELECT DISTINCT content_type FROM {$table_name} WHERE status = 'publish'"); // phpcs:ignore
            return ['success' => false, 'message' => 'No template found. Available: ' . implode(', ', $available)];
        }

        $template_id  = intval($template->id);
        $content_type = $content_type ?: (string) $template->content_type;

        // 2. Order for placeholder data (same as production)
        if ($order_id > 0) {
            $order = wc_get_order($order_id);
        } else {
            $orders   = wc_get_orders(['limit' => 1, 'orderby' => 'date', 'order' => 'DESC']);
            $order    = !empty($orders) ? $orders[0] : null;
            $order_id = $order ? $order->get_id() : 0;
        }

        // 3. Build body (exact same as send_email_for_type)
        $settings     = !empty($template->settings) ? json_decode($template->settings, true) : [];
        $header_color = esc_attr($settings['header_color'] ?? '#F44336');
        $footer_color = esc_attr($settings['footer_color'] ?? '#333333');
        $font         = esc_attr($settings['font'] ?? 'Poppins');

        $html_content = stripslashes($template->html_content);
        $subject      = !empty($template->email_template_name) ? $template->email_template_name : 'Test Email';

        $body    = self::replace_email_placeholders($html_content, $order_id, $order, $header_color, $footer_color, $font, $template_id, []);
        $subject = self::replace_email_placeholders($subject,      $order_id, $order, $header_color, $footer_color, $font, $template_id, []);
        $subject = '[TEST] ' . $subject;

        // 4. Insert log row FIRST to get log_id for pixel (same as production)
        $log_id = $this->log_email($order_id, $template_id, $to, $subject, 'pending');

        // 5. Inject tracking pixel (same as production)
        $tracking_url   = add_query_arg(['email-tracker' => '1', 'log_id' => intval($log_id)], site_url('/'));
        $tracking_pixel = '<img src="' . esc_url($tracking_url) . '" width="1" height="1" alt="" border="0" '
                        . 'style="height:1px!important;width:1px!important;border-width:0!important;margin:0!important;padding:0!important;" />';

        if (stripos($body, '</body>') !== false) {
            $body = str_ireplace('</body>', $tracking_pixel . '</body>', $body);
        } else {
            $body .= $tracking_pixel;
        }

        // 6. Send (same headers as production)
        $from_name    = get_option('woocommerce_email_from_name', get_bloginfo('name'));
        $from_address = get_option('woocommerce_email_from_address', get_option('admin_email'));
        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . esc_attr($from_name) . ' <' . sanitize_email($from_address) . '>',
            'Reply-To: ' . esc_attr($from_name) . ' <' . sanitize_email($from_address) . '>',
        ];

        $sent = wp_mail($to, $subject, $body, $headers);

        // 7. Update log row (same as production)
        if ($sent) {
            $this->log_analytics($template_id);
            $wpdb->update($wpdb->prefix . 'woo_email_logs', ['status' => 'success'], ['id' => $log_id]); // phpcs:ignore
        } else {
            $wpdb->update($wpdb->prefix . 'woo_email_logs', ['status' => 'failed', 'error_message' => 'wp_mail returned false'], ['id' => $log_id]); // phpcs:ignore
        }

        $stored_key = get_option('wetc_tracker_verify_key', '');
        $verify_url = $stored_key
            ? add_query_arg(['key' => $stored_key, 'log_id' => $log_id], site_url('/wp-json/woomailer/v1/verify-tracker'))
            : '';

        return [
            'success'       => $sent,
            'log_id'        => $log_id,
            'to'            => $to,
            'subject'       => $subject,
            'template_id'   => $template_id,
            'template_name' => $template->email_template_name,
            'content_type'  => $content_type,
            'order_id'      => $order_id,
            'tracker_url'   => $tracking_url,
            'verify_url'    => $verify_url,
        ];
    }

    private static function wetc_find_block_by_content_type($node, $type) {
        if (!is_array($node)) {
            return null;
        }
        if (isset($node['contentType']) && $node['contentType'] === $type) {
            return $node;
        }
        foreach ($node as $key => $val) {
            if (is_array($val)) {
                $found = self::wetc_find_block_by_content_type($val, $type);
                if ($found) {
                    return $found;
                }
            }
        }
        return null;
    }

    private static function wetc_to_css_string($sx) {
        if (!is_array($sx)) return '';
        $result = [];

        if (!empty($sx['padding']) && is_array($sx['padding'])) {
            $p = $sx['padding'];
            if (isset($p['top'])) $result['padding-top'] = $p['top'] . 'px';
            if (isset($p['right'])) $result['padding-right'] = $p['right'] . 'px';
            if (isset($p['bottom'])) $result['padding-bottom'] = $p['bottom'] . 'px';
            if (isset($p['left'])) $result['padding-left'] = $p['left'] . 'px';
        } elseif (isset($sx['padding'])) {
            $result['padding'] = is_numeric($sx['padding']) ? $sx['padding'] . 'px' : $sx['padding'];
        }

        if (!empty($sx['margin']) && is_array($sx['margin'])) {
            $m = $sx['margin'];
            if (isset($m['top'])) $result['margin-top'] = $m['top'] . 'px';
            if (isset($m['right'])) $result['margin-right'] = $m['right'] . 'px';
            if (isset($m['bottom'])) $result['margin-bottom'] = $m['bottom'] . 'px';
            if (isset($m['left'])) $result['margin-left'] = $m['left'] . 'px';
        } elseif (isset($sx['margin'])) {
            $result['margin'] = is_numeric($sx['margin']) ? $sx['margin'] . 'px' : $sx['margin'];
        }

        if (!empty($sx['borderRadius']) && is_array($sx['borderRadius'])) {
            $r = $sx['borderRadius'];
            $result['border-radius'] = ($r['top'] ?? 0) . 'px ' . ($r['right'] ?? 0) . 'px ' . ($r['bottom'] ?? 0) . 'px ' . ($r['left'] ?? 0) . 'px';
        } elseif (isset($sx['borderRadius'])) {
            $result['border-radius'] = is_numeric($sx['borderRadius']) ? $sx['borderRadius'] . 'px' : $sx['borderRadius'];
        }

        foreach (['Top', 'Right', 'Bottom', 'Left'] as $side) {
            $key = 'border' . $side;
            $sideLower = strtolower($side);
            if (isset($sx[$key . 'Width']) || isset($sx[$key . 'Style']) || isset($sx[$key . 'Color'])) {
                $w = $sx[$key . 'Width'] ?? 0;
                $s = $sx[$key . 'Style'] ?? 'solid';
                $c = $sx[$key . 'Color'] ?? '#0000';
                $result['border-' . $sideLower] = "{$w}px {$s} {$c}";
            }
        }

        $directProps = [
            'fontFamily', 'fontWeight', 'fontSize', 'color', 'backgroundColor', 'textAlign', 'lineHeight', 'letterSpacing',
            'display', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap', 'columnGap', 'rowGap', 'width', 'height',
            'textDecoration'
        ];
        foreach ($directProps as $prop) {
            if (isset($sx[$prop])) {
                $cssProp = strtolower(preg_replace('/([A-Z])/', '-$1', $prop));
                $val = $sx[$prop];
                if (is_numeric($val) && in_array($prop, ['fontSize', 'lineHeight', 'letterSpacing', 'width', 'height'])) {
                    if ($prop !== 'lineHeight' || $val > 3) {
                        $val = $val . 'px';
                    }
                }
                $result[$cssProp] = $val;
            }
        }

        $str = '';
        foreach ($result as $k => $v) {
            $str .= "$k: $v; ";
        }
        return trim($str);
    }
}



WETC_Email_Handler::get_instance();


?>