<?php

namespace SmackCoders\WETC;

if (!defined('ABSPATH')) {
    die;
}

if (!class_exists('WP_List_Table')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

require_once SMACK_WETC_PLUGIN_PATH . 'includes/class-wetc-manager.php';
require_once SMACK_WETC_PLUGIN_PATH . 'includes/emailLogs/class-wetc-email-logs.php';

class WETC_Connector {
    const MENU_SLUG = 'email-customizer-add-new';

    private static $instance = null;
    public $list_table;

    public function __construct() {
        add_action('admin_menu', [$this, 'add_posts_menu_items']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('init', [$this, 'create_order_details_table']);
        add_action('woocommerce_checkout_create_order', [$this, 'save_order_details_to_db'], 10, 2);
        add_action('wp_ajax_get_email_template_json', [$this, 'get_email_template_json_callback']);
        add_action('wp_ajax_get_email_template_names', [$this, 'get_email_template_names_callback']);
        add_action('wp_ajax_get_woocommerce_data', [$this, 'get_woocommerce_data_callback']);
        add_action('wp_ajax_save_email_template', [$this, 'save_email_template_callback']);
        add_action('wp_ajax_send_test_email', [$this, 'send_test_email_callback']);
        add_action('wp_ajax_wetc_upload_image', [$this, 'wetc_upload_image_callback']);

        // Handle List Table Actions
        add_action('admin_post_wetc_trash_template', [$this, 'handle_trash_template']);
        add_action('admin_post_wetc_restore_template', [$this, 'handle_restore_template']);
        add_action('admin_post_wetc_delete_template', [$this, 'handle_delete_template']);
        add_action('admin_post_wetc_duplicate_template', [$this, 'handle_duplicate_template']);
        add_action('admin_post_wetc_bulk_delete_logs', [$this, 'handle_bulk_delete_logs']);

        add_filter('set-screen-option', [__CLASS__, 'set_screen_option'], 10, 3);
    }

    public function handle_trash_template() {
        $this->handle_template_status_change('trash');
    }

    public function handle_restore_template() {
        $this->handle_template_status_change('publish');
    }

    private function handle_template_status_change($new_status) {
        if (!isset($_GET['id'])) wp_die('No ID provided');
        $id = intval($_GET['id']);
        
        // Use either specific nonce or generic one based on context, but match creation
        check_admin_referer('wetc_' . ($new_status == 'trash' ? 'trash' : 'restore') . '_template_' . $id);

        global $wpdb;
        $table_name = $wpdb->prefix . 'wetc_email_templates';
        $wpdb->update($table_name, ['status' => $new_status], ['id' => $id]); // phpcs:ignore

        wp_safe_redirect(remove_query_arg(['action', 'id', '_wpnonce'], wp_get_referer()));
        exit;
    }

    public function handle_delete_template() {
        if (!isset($_GET['id'])) wp_die('No ID provided');
        $id = intval($_GET['id']);
        check_admin_referer('wetc_delete_template_' . $id);

        global $wpdb;
        $table_name = $wpdb->prefix . 'wetc_email_templates';
        $wpdb->delete($table_name, ['id' => $id]); // phpcs:ignore

        wp_safe_redirect(remove_query_arg(['action', 'id', '_wpnonce'], wp_get_referer()));
        exit;
    }

    public function handle_duplicate_template() {
        if (!isset($_GET['id'])) wp_die('No ID provided');
        $id = intval($_GET['id']);
        check_admin_referer('wetc_duplicate_template_' . $id);

        global $wpdb;
        $table_name = $wpdb->prefix . 'wetc_email_templates';
        $original = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id), ARRAY_A); // phpcs:ignore

        if ($original) {
            unset($original['id']);
            $original['email_template_name'] .= ' (Copy)';
            $wpdb->insert($table_name, $original); // phpcs:ignore
        }

        wp_safe_redirect(remove_query_arg(['action', 'id', '_wpnonce'], wp_get_referer()));
        exit;
    }

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function create_order_details_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'woo_order_details';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            order_id BIGINT(20) UNSIGNED NOT NULL,
            order_items LONGTEXT NOT NULL,
            billing_address LONGTEXT NOT NULL,  
            shipping_address LONGTEXT NOT NULL,
            date_created DATETIME NOT NULL,
            template_id BIGINT(20) UNSIGNED DEFAULT 0,
            PRIMARY KEY (id),
            KEY order_id (order_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }

    public function save_order_details_to_db($order, $data) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'woo_order_details';

        $order_items = [];
        foreach ($order->get_items() as $item_id => $item) {
            $product = $item->get_product();
            $order_items[] = [
                'product_id' => $item->get_product_id(),
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'subtotal' => $item->get_subtotal(),
                'total' => $item->get_total(),
            ];
        }

        $billing_address = [
            'first_name' => $order->get_billing_first_name(),
            'last_name' => $order->get_billing_last_name(),
            'company' => $order->get_billing_company(),
            'address_1' => $order->get_billing_address_1(),
            'address_2' => $order->get_billing_address_2(),
            'city' => $order->get_billing_city(),
            'state' => $order->get_billing_state(),
            'postcode' => $order->get_billing_postcode(),
            'country' => $order->get_billing_country(),
            'email' => $order->get_billing_email(),
            'phone' => $order->get_billing_phone(),
        ];

        $shipping_address = [
            'first_name' => $order->get_shipping_first_name(),
            'last_name' => $order->get_shipping_last_name(),
            'company' => $order->get_shipping_company(),
            'address_1' => $order->get_shipping_address_1(),
            'address_2' => $order->get_shipping_address_2(),
            'city' => $order->get_shipping_city(),
            'state' => $order->get_shipping_state(),
            'postcode' => $order->get_shipping_postcode(),
            'country' => $order->get_shipping_country(),
        ];

        $result = $wpdb->insert( // phpcs:ignore
            $table_name,
            [
                'order_id' => $order->get_id(),
                'order_items' => wp_json_encode($order_items),
                'billing_address' => wp_json_encode($billing_address),
                'shipping_address' => wp_json_encode($shipping_address),
                'date_created' => current_time('mysql'),
                'template_id' => 0,
            ],
            ['%d', '%s', '%s', '%s', '%s', '%d']
        );

        if (false === $result) {
            // error_log('WETC_Connector: Failed to insert order details for order ID ' . $order->get_id());
        }
    }

    public function enqueue_assets($hook_suffix) {
        // error_log('WETC DEBUG: hook_suffix = ' . $hook_suffix);
        // Only load assets on the email customizer list or add/edit pages
        // Relaxed check to ensure it catches the correct page hooks regardless of parent slug prefix
        $is_email_log = strpos($hook_suffix, 'wetc-email-log') !== false;
        if (strpos($hook_suffix, 'posts_list_table') === false && strpos($hook_suffix, self::MENU_SLUG) === false && !$is_email_log) {
            return;
        }

        // Enqueue WordPress media library scripts
        wp_enqueue_media();

        // Enqueue native WordPress TinyMCE Editor
        if (strpos($hook_suffix, self::MENU_SLUG) !== false) {
            wp_enqueue_editor();
        }

        // Enqueue email template fetcher script
        wp_enqueue_script(
            'email-template-fetcher',
            SMACK_WETC_PLUGIN_URL . 'assets/js/email-template-fetcher.js',
            ['jquery'],
            '1.0',
            true
        );

        wp_localize_script(
            'email-template-fetcher',
            'emailTemplateAjax',
            [
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('get_email_template_names_nonce'),
                'admin_email' => get_option('admin_email'), // Pass admin email to frontend
                'plugin_url' => SMACK_WETC_PLUGIN_URL // Pass plugin URL for local assets
            ]
        );

        // Enqueue AJAX script for handling template JSON retrieval
        wp_enqueue_script(
            'email-customizer-ajax',
            SMACK_WETC_PLUGIN_URL . 'assets/js/email-customizer-ajax.js',
            ['jquery'],
            '1.0.0',
            true
        );

        $ai_providers_data = [];
        if (class_exists('\WordPress\AiClient\AiClient')) {
            $registry = \WordPress\AiClient\AiClient::defaultRegistry();
            foreach ($registry->getRegisteredProviderIds() as $provider_id) {
                if (!$registry->isProviderConfigured($provider_id)) {
                    continue;
                }
                
                $provider_class = $registry->getProviderClassName($provider_id);
                $metadata = $provider_class::metadata();
                
                $slug = $metadata->getId();
                $name = $metadata->getName();
                $models = [];
                
                if (method_exists($provider_class, 'modelMetadataDirectory')) {
                    try {
                        $dir = $provider_class::modelMetadataDirectory();
                        $models_metadata = $dir->listModelMetadata();
                        foreach ($models_metadata as $model_meta) {
                            $models[] = [
                                'id' => $model_meta->getId(),
                                'name' => $model_meta->getName()
                            ];
                        }
                    } catch (\Exception $e) {
                        // Suppress network or API key errors
                    }
                }
                
                $ai_providers_data[] = [
                    'id' => $slug,
                    'name' => $name,
                    'models' => $models
                ];
            }
        }

        wp_localize_script(
            'email-customizer-ajax',
            'emailCustomizerAjax',
            [
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('get_template_json_nonce'),
                'ai_providers' => $ai_providers_data
            ]
        );

        // Load React app assets ONLY on the Add New / Edit page
        if (strpos($hook_suffix, self::MENU_SLUG) !== false) {
            $plugin_url = SMACK_WETC_PLUGIN_URL . 'assets';
            
            // Enqueue React build JS/CSS
            $js_path = SMACK_WETC_PLUGIN_PATH . 'assets/js/app_bundle.js';
            $css_path = SMACK_WETC_PLUGIN_PATH . 'assets/css/app_bundle.css';

            // Force reload by using current time if file exists
            $js_ver = file_exists($js_path) ? filemtime($js_path) . '_' . time() : time();
            $css_ver = file_exists($css_path) ? filemtime($css_path) . '_' . time() : time();

            wp_enqueue_style('react-email-customizer-css-main', $plugin_url . '/css/app_bundle.css', [], $css_ver);
            wp_enqueue_script('react-email-customizer-js-main', $plugin_url . '/js/app_bundle.js', ['email-customizer-ajax', 'email-template-fetcher'], $js_ver, true);
            
            wp_localize_script(
                'react-email-customizer-js-main',
                'emailCustomizerAjax',
                [
                    'ajax_url' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('get_template_json_nonce'),
                    'ai_providers' => $ai_providers_data
                ]
            );
        }

        wp_enqueue_style(
            'wetc-mail-style',
            SMACK_WETC_PLUGIN_URL . 'assets/css/style.css',
            [],
            '1.0.0'
        );

        // Load premium email log styles only on the Email Log page
        if ($is_email_log) {
            wp_enqueue_style(
                'wetc-email-log-style',
                SMACK_WETC_PLUGIN_URL . 'assets/css/email-log-menu.css',
                [],
                '1.0.0'
            );
        }
    }

    public function add_posts_menu_items() {
        $hook = add_menu_page(
            __('WooMailer', 'wc-email-template-customizer'),
            __('WooMailer', 'wc-email-template-customizer'),
            'edit_posts',
            'posts_list_table',
            [$this, 'posts_list_init'],
            'dashicons-email-alt',
            1
        );

        add_action("load-$hook", [$this, 'init_screen_options']);

        add_submenu_page(
            'posts_list_table',
            __('Add New', 'wc-email-template-customizer'),
            __('Add New', 'wc-email-template-customizer'),
            'manage_options',
            self::MENU_SLUG,
            [$this, 'submenu_add_new_page']
        );

        $hook2 = add_submenu_page(
            'posts_list_table',
            __('Email Log', 'wc-email-template-customizer'),
            __('Email Log', 'wc-email-template-customizer'),
            'manage_options',
            'wetc-email-log',
            ['\SmackCoders\WETC\EmailLogs\WETC_Email_Logs_Table', 'render_page']
        );
        add_action("load-$hook2", [$this, 'init_email_log_screen_options']);
    }

    public function init_email_log_screen_options() {
        $option = 'per_page';
        $args = [
            'label'   => __('Email Logs per page', 'wc-email-template-customizer'),
            'default' => 20,
            'option'  => 'wetc_logs_per_page'
        ];
        add_screen_option($option, $args);

        // Required to make columns show up in screen options for hiding
        $this->log_table = new \SmackCoders\WETC\EmailLogs\WETC_Email_Logs_Table();
        $screen = get_current_screen();
        if ($screen) {
            update_user_option(get_current_user_id(), "manage{$screen->id}columnshidden", []);
            add_filter("manage_{$screen->id}_columns", [$this, 'get_email_log_screen_columns']);
            add_filter("default_hidden_columns", [$this, 'get_default_hidden_columns'], 10, 2);
        }
    }

    public function get_email_log_screen_columns($columns) {
        $cols = $this->log_table->get_columns();
        if (isset($cols['cb'])) {
            unset($cols['cb']);
        }
        return $cols;
    }

    public function init_screen_options() {
        $option = 'per_page';
        $args = [
            'label'   => __('Email Templates per page', 'wc-email-template-customizer'),
            'default' => 20,
            'option'  => 'wetc_templates_per_page'
        ];
        add_screen_option($option, $args);
        
        // Ensure the class is loaded for column headers logic if needed
        $this->list_table = new Posts_List_Table();
        
        $screen = get_current_screen();
        if ($screen) {
            // Force reset hidden columns preference so they are always checked by default
            // Using update_user_option to explicitly set it to 'empty' (nothing hidden)
            update_user_option(get_current_user_id(), "manage{$screen->id}columnshidden", []);
            
            add_filter("manage_{$screen->id}_columns", [$this, 'get_screen_columns']);
            add_filter("default_hidden_columns", [$this, 'get_default_hidden_columns'], 10, 2);
        }
    }

    public function get_screen_columns($columns) {
        // Remove columns we don't want in Screen Options checkboxes
        if (isset($columns['email_template_name'])) {
            unset($columns['email_template_name']);
        }
        if (isset($columns['cb'])) {
            unset($columns['cb']);
        }
        return $columns;
    }

    public function get_default_hidden_columns($hidden, $screen) {
        // Default to showing all columns (return empty array of hidden items)
        return [];
    }
    
    // Filter to handle saving screen options
    public static function set_screen_option($status, $option, $value) {
        if ('wetc_templates_per_page' === $option || 'wetc_logs_per_page' === $option) {
            return $value;
        }
        return $status;
    }

    public function submenu_add_new_page() {
        ?>
        <div class="wrap">
            <div id="root"></div> <!-- React mounts here -->
        </div>
        <?php
    }

    public function posts_list_init() {
        $list_table = new Posts_List_Table();
        $list_table->prepare_items();
        
        $current_page = isset($_REQUEST['page']) ? sanitize_text_field(wp_unslash($_REQUEST['page'])) : ''; // phpcs:ignore
        echo '<div class="wrap">';
        echo '<h1 class="wp-heading-inline">' . esc_html__('Email Templates', 'wc-email-template-customizer') . '</h1>';
        echo '<a href="' . esc_url(admin_url('admin.php?page=email-customizer-add-new')) . '" class="page-title-action">Add New</a>';
        
        // Import Button and Logic
        echo '<button id="wetc-import-btn" class="page-title-action">Import</button>';
        echo '<input type="file" id="wetc-import-file" accept=".json" style="display:none;" />';
        echo '<hr class="wp-header-end">';
        
        // Output search box
        echo '<form method="get">';
        echo '<input type="hidden" name="page" value="' . esc_attr($current_page) . '" />'; 
        $list_table->views(); // Display status views (All | Published | Trash)
        $list_table->search_box('search', 'search_id');
        $list_table->display();
        echo '</form>';
        echo '</div>';
    }



    public function get_email_template_json_callback() {
        if (!check_ajax_referer('get_template_json_nonce', '_ajax_nonce', false)) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            wp_die();
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'wetc_email_templates';
        $template_id = isset($_POST['template_id']) ? absint($_POST['template_id']) : 0;

        if ($template_id <= 0) {
            wp_send_json_error(['message' => 'Invalid template ID']);
        }

        $email_template = $wpdb->get_row( // phpcs:ignore
            $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $template_id) // phpcs:ignore 
        );

        if ($email_template && !empty($email_template->json_data)) {
            $decoded = json_decode($email_template->json_data);
            if (json_last_error() !== JSON_ERROR_NONE) {
                wp_send_json_error(['message' => 'Stored template data is corrupted: ' . json_last_error_msg()]);
            } else {
                wp_send_json_success(['json_data' => $email_template->json_data,'title'=> $email_template->email_template_name,'description'=> $email_template->template_note,'priority'=> $email_template->priority,'content_type'=> $email_template->content_type,'recipient'=> $email_template->recipient,'status'=> $email_template->status]);
            }
        } else {
            wp_send_json_error(['message' => 'No JSON data found for this template']);
        }
    }
    public function get_email_template_names_callback() {
        if (!check_ajax_referer('get_email_template_names_nonce', '_ajax_nonce', false)) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            wp_die();
        }

        // Try to get cached template list
        $cache_key = 'wetc_template_names_list_v3';
        $cached_templates = get_transient($cache_key);

        if (false !== $cached_templates) {
            wp_send_json_success(['templates' => $cached_templates]);
            return;
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'wetc_email_templates';

        // Check if priority column exists (handles cases where migration hasn't run)
        $column_check = $wpdb->get_results("SHOW COLUMNS FROM {$table_name} LIKE 'priority'"); // phpcs:ignore
        $has_priority = !empty($column_check);

        // Include json_data - frontend needs it for template loading
        // Performance is still optimized via caching
        $fields = "id, email_template_name, json_data, content_type, status" . ($has_priority ? ", priority" : "");
        $results = $wpdb->get_results( // phpcs:ignore
            "SELECT {$fields} FROM {$table_name}", // phpcs:ignore
            ARRAY_A
        );


        if (!empty($results)) {
            // Cache for 5 minutes
            set_transient($cache_key, $results, 5 * MINUTE_IN_SECONDS);
            wp_send_json_success(['templates' => $results]);
        } else {
            wp_send_json_error(['message' => 'No templates found']);
        }
    }

    public function save_email_template_callback() {
        // Security check
        if (!check_ajax_referer('get_email_template_names_nonce', '_ajax_nonce', false)) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            wp_die();
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'wetc_email_templates';

        $template_name = isset($_POST['template_name']) ? sanitize_text_field(wp_unslash($_POST['template_name'])) : ''; 
        $subject = isset($_POST['subject']) ? sanitize_text_field(wp_unslash($_POST['subject'])) : '';
        $json_data = isset($_POST['json_data']) ? wp_unslash($_POST['json_data']) : ''; // phpcs:ignore
        $html_content = isset($_POST['html_content']) ? wp_unslash($_POST['html_content']) : ''; // phpcs:ignore
        $template_id = isset($_POST['template_id']) ? absint($_POST['template_id']) : 0;
        $content_type = isset($_POST['content_type']) ? sanitize_text_field(wp_unslash($_POST['content_type'])) : 'JSON';
        $recipient = isset($_POST['recipient']) ? sanitize_text_field(wp_unslash($_POST['recipient'])) : '';
        $priority = isset($_POST['priority']) ? intval($_POST['priority']) : 0;
        $template_note = isset($_POST['template_note']) ? sanitize_textarea_field(wp_unslash($_POST['template_note'])) : '';
        $requested_status = isset($_POST['template_status']) ? sanitize_text_field(wp_unslash($_POST['template_status'])) : 'publish';



        if (empty($template_name)) {
            wp_send_json_error(['message' => 'Template name is required']);
            wp_die();
        }

        if (empty($json_data)) {
            wp_send_json_error(['message' => 'Template content is required']);
            wp_die();
        }

        // Validate JSON before saving
        $decoded = json_decode($json_data);
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error(['message' => 'Invalid JSON data: ' . json_last_error_msg()]);
            wp_die();
        }

        // Prepare data array - include html_content if it exists
        $current_time = current_time('mysql');
        $data = [
            'email_template_name'   => $template_name,
            'subject'               => $subject,
            'json_data'             => $json_data,
            'content_type'          => $content_type,
            'recipient'             => $recipient,
            'template_note'         => $template_note,
            'priority'              => $priority,
            'created_at'            => $current_time, // Update timestamp
            'status'                => $requested_status,
            'html_content'          => $html_content,
        ];
        
        $formats = ['%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s'];


        // Check if updating existing template or creating new one
        if ($template_id > 0) {
            // Check current status in DB
            $current_template = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $template_id)); // phpcs:ignore

            if(empty($current_template->id)){
                $result = $wpdb->insert( // phpcs:ignore
                    $table_name,
                    $data,
                    $formats
                );
            }else{
                // Otherwise, update existing template
                $result = $wpdb->update( // phpcs:ignore
                    $table_name,
                    $data,
                    ['id' => $template_id],
                    $formats,
                    ['%d']
                );
            }


            if ($result !== false) {
                // Clear template list cache after update
                delete_transient('wetc_template_names_list_v3');
                wp_send_json_success([
                    'message' => 'Template updated successfully',
                    'template_id' => $template_id
                ]);
            } else {
                wp_send_json_error(['message' => 'Failed to update template']);
            }
        } else {
            // Insert new template
            $result = $wpdb->insert( // phpcs:ignore
                $table_name,
                $data,
                $formats
            );

            if ($result !== false) {
                // Clear template list cache after insert
                delete_transient('wetc_template_names_list_v3');
                wp_send_json_success([
                    'message' => 'Template saved successfully',
                    'template_id' => $wpdb->insert_id
                ]);
            } else {
                wp_send_json_error(['message' => 'Failed to save template']);
            }
        }

    }

    public function send_test_email_callback() {
        if (!check_ajax_referer('get_email_template_names_nonce', '_ajax_nonce', false)) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            wp_die();
        }

        $to_email = isset($_POST['to_email']) ? sanitize_email(wp_unslash($_POST['to_email'])) : '';
        $html_content = isset($_POST['html_content']) ? wp_unslash($_POST['html_content']) : ''; // phpcs:ignore

        if (!is_email($to_email)) {
            wp_send_json_error(['message' => 'Invalid email address']);
            wp_die();
        }

        if (empty($html_content)) {
            wp_send_json_error(['message' => 'Email content is empty']);
            wp_die();
        }

        // Decode HTML entities to ensure proper rendering in email clients
        $html_content = html_entity_decode($html_content, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Optional: Wrap in basic HTML structure if missing
        if (strpos($html_content, '<html') === false) {
            $html_content = '<html><body style="margin:0; padding:0;">' . $html_content . '</body></html>';
        }

        $subject = 'Test Email - ' . get_bloginfo('name');

        // Apply placeholder replacement for test emails
        if (class_exists('WooCommerce')) {
            $orders = wc_get_orders(['limit' => 1, 'status' => ['completed', 'processing', 'on-hold'], 'orderby' => 'date', 'order' => 'DESC']);
            $order = !empty($orders) ? $orders[0] : null;
            $order_id = $order ? $order->get_id() : 0;

            // Use the utility function from WETC_Email_Handler to replace all placeholders
            if (class_exists('\SmackCoders\WETC\WETC_Email_Handler')) {
                $handler = \SmackCoders\WETC\WETC_Email_Handler::get_instance();
                
                // We need to pass some default values for style if we don't have them easily accessible
                $header_color = '#F44336';
                $footer_color = '#333333';
                $font = 'Poppins';
                
                $html_content = \SmackCoders\WETC\WETC_Email_Handler::replace_email_placeholders(
                    $html_content, 
                    $order_id, 
                    $order, 
                    $header_color, 
                    $footer_color, 
                    $font
                );
                
                $subject = \SmackCoders\WETC\WETC_Email_Handler::replace_email_placeholders(
                    $subject, 
                    $order_id, 
                    $order, 
                    $header_color, 
                    $footer_color, 
                    $font
                );
            }
        }

        $headers = ['Content-Type: text/html; charset=UTF-8'];

        $sent = wp_mail($to_email, $subject, $html_content, $headers);

        if ($sent) {
            wp_send_json_success(['message' => 'Test email sent successfully!']);
        } else {
            wp_send_json_error(['message' => 'Failed to send test email. Check server mail logs.']);
        }
    }

    public function get_woocommerce_data_callback() {
        if (!check_ajax_referer('get_template_json_nonce', '_ajax_nonce', false)) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            wp_die();
        }

        if (!class_exists('WooCommerce')) {
            wp_send_json_error(['message' => 'WooCommerce is not active']);
            wp_die();
        }

        $data = [
            'site_url' => site_url(),
            'site_name' => get_bloginfo('name'),
            'site_title' => get_bloginfo('name'),
            'store_name' => get_bloginfo('name'),
            'store_email' => get_option('admin_email'),
            'admin_email' => get_option('admin_email'),
            'store_phone' => get_option('woocommerce_store_phone', ''),
            'store_address' => function_exists('WC') ? WC()->countries->get_base_address() : '',
            'store_tagline' => get_bloginfo('description'),
            'current_year' => wp_date('Y'),
            'year' => wp_date('Y'),
            'home_url' => home_url(),
            'shop_url' => function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url(),
            'checkout_url' => function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : site_url('/checkout'),
            'my_account_url' => function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : site_url('/my-account'),
            'logo_url' => get_theme_mod('custom_logo') ? wp_get_attachment_image_src(get_theme_mod('custom_logo'), 'full')[0] : '',
        ];

        if (class_exists('WooCommerce')) {
            // Latest Order Data
            $orders = wc_get_orders(['limit' => 1, 'status' => ['completed', 'processing', 'on-hold'], 'orderby' => 'date', 'order' => 'DESC']);
            if (!empty($orders)) {
                $order = $orders[0];
                $data = array_merge($data, [
                    'order_id' => $order->get_order_number(),
                    'order_number' => $order->get_order_number(),
                    'order_date' => $order->get_date_created() ? $order->get_date_created()->date(get_option('date_format')) : wp_date(get_option('date_format')),
                    'order_url' => $order->get_view_order_url(),
                    'admin_order_url' => admin_url('post.php?post=' . $order->get_id() . '&action=edit'),
                    'customer_name' => $order->get_billing_first_name(),
                    'customer_first_name' => $order->get_billing_first_name(),
                    'customer_last_name' => $order->get_billing_last_name(),
                    'customer_full_name' => $order->get_formatted_billing_full_name(),
                    'customer_email' => $order->get_billing_email(),
                    'billing_name' => $order->get_formatted_billing_full_name(),
                    'billing_first_name' => $order->get_billing_first_name(),
                    'billing_last_name' => $order->get_billing_last_name(),
                    'billing_address_1' => $order->get_billing_address_1(),
                    'billing_address_2' => $order->get_billing_address_2(),
                    'billing_city' => $order->get_billing_city(),
                    'billing_state' => $order->get_billing_state(),
                    'billing_postcode' => $order->get_billing_postcode(),
                    'billing_country' => $order->get_billing_country(),
                    'billing_phone' => $order->get_billing_phone(),
                    'billing_email' => $order->get_billing_email(),
                    'shipping_name' => $order->get_formatted_shipping_full_name(),
                    'shipping_first_name' => $order->get_shipping_first_name(),
                    'shipping_last_name' => $order->get_shipping_last_name(),
                    'shipping_address_1' => $order->get_shipping_address_1(),
                    'shipping_address_2' => $order->get_shipping_address_2(),
                    'shipping_city' => $order->get_shipping_city(),
                    'shipping_state' => $order->get_shipping_state(),
                    'shipping_postcode' => $order->get_shipping_postcode(),
                    'shipping_country' => $order->get_shipping_country(),
                    'shipping_phone' => $order->get_billing_phone(), 
                    'shipping_email' => $order->get_billing_email(),
                    'order_total' => html_entity_decode(wp_strip_all_tags(wc_price($order->get_total())), ENT_QUOTES, 'UTF-8'),
                    'order_subtotal' => html_entity_decode(wp_strip_all_tags(wc_price($order->get_subtotal())), ENT_QUOTES, 'UTF-8'),
                    'order_tax' => html_entity_decode(wp_strip_all_tags(wc_price($order->get_total_tax())), ENT_QUOTES, 'UTF-8'),
                    'tax_amount' => html_entity_decode(wp_strip_all_tags(wc_price($order->get_total_tax())), ENT_QUOTES, 'UTF-8'),
                    'order_shipping' => html_entity_decode(wp_strip_all_tags(wc_price($order->get_shipping_total())), ENT_QUOTES, 'UTF-8'),
                    'order_discount' => html_entity_decode(wp_strip_all_tags(wc_price($order->get_total_discount())), ENT_QUOTES, 'UTF-8'),
                    'payment_method' => $order->get_payment_method_title(),
                    'shipping_method' => $order->get_shipping_method(),
                    'order_status' => wc_get_order_status_name($order->get_status()),
                    'currency' => $order->get_currency(),
                    'customer_note' => $order->get_customer_note(),
                ]);

                // Generate Order Items Rows HTML
                $items_html = '';
                foreach ($order->get_items() as $item) {
                    $product = $item->get_product();
                    $items_html .= '<tr>';
                    $items_html .= '<td style="padding: 8px; border: 1px solid #eee;">' . esc_html($item->get_name()) . '</td>';
                    $items_html .= '<td style="padding: 8px; border: 1px solid #eee; text-align: center;">' . esc_html($item->get_quantity()) . '</td>';
                    $items_html .= '<td style="padding: 8px; border: 1px solid #eee; text-align: right;">' . html_entity_decode(wp_strip_all_tags(wc_price($order->get_line_total($item, true))), ENT_QUOTES, 'UTF-8') . '</td>';
                    $items_html .= '</tr>';
                }
                $data['order_items_rows'] = $items_html;
                $data['order_items'] = $items_html;
                $data['order_details_table_basic'] = '<table style="width: 100%; border-collapse: collapse;"><thead><tr><th style="padding: 8px; border: 1px solid #eee; text-align: left;">Product</th><th style="padding: 8px; border: 1px solid #eee; text-align: center;">Qty</th><th style="padding: 8px; border: 1px solid #eee; text-align: right;">Price</th></tr></thead><tbody>' . $items_html . '</tbody></table>';
                $data['order_details_table_with_images'] = $data['order_details_table_basic']; // Placeholder for now
            }

            // Latest 4 Products
            $products = wc_get_products(['limit' => 4, 'status' => 'publish', 'orderby' => 'date', 'order' => 'DESC']);
            $i = 1;
            foreach ($products as $product) {
                $data["product_name_$i"] = $product->get_name();
                $data["product_price_$i"] = html_entity_decode(wp_strip_all_tags(wc_price($product->get_price())), ENT_QUOTES, 'UTF-8');
                $img_id = $product->get_image_id();
                $data["product_image_$i"] = $img_id ? wp_get_attachment_image_src($img_id, 'medium')[0] : wc_placeholder_img_src();
                $data["product_url_$i"] = $product->get_permalink();
                $i++;
            }

            // Add tax_rate to data for frontend preview
            if (!isset($data['tax_rate']) && !empty($orders)) {
                $order = $orders[0];
                $taxes = $order->get_taxes();
                $tax_rate_val = '0%';
                foreach ($taxes as $tax) {
                    $rate_id = $tax->get_rate_id();
                    $tax_rate_val = \WC_Tax::get_rate_percent_value($rate_id) . '%';
                    break;
                }
                $data['tax_rate'] = $tax_rate_val;
            } else if (!isset($data['tax_rate'])) {
                $data['tax_rate'] = '0%';
            }
        }

        wp_send_json_success($data);
    }

    public function wetc_upload_image_callback() {
        if (!current_user_can('upload_files')) {
            wp_send_json_error(['message' => 'Permission denied']);
        }

        if (empty($_FILES['image_file'])) {
            wp_send_json_error(['message' => 'No file uploaded']);
        }

        require_once(ABSPATH . 'wp-admin/includes/image.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');

        $attachment_id = media_handle_upload('image_file', 0);

        if (is_wp_error($attachment_id)) {
            wp_send_json_error(['message' => $attachment_id->get_error_message()]);
        }

        $url = wp_get_attachment_url($attachment_id);
        wp_send_json_success(['url' => $url]);
    }
}

WETC_Connector::get_instance();
?>