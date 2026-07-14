<?php

namespace SmackCoders\WETC;

if (!defined('ABSPATH')) {
    die;
}

class WETC_Installer {  

    private static $instance = null;

    private function __construct() {
        // add_action('init', [$this, 'register_email_post_type']);
    }

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    } 

    public static function activate() {
        // Use output buffering to prevent unexpected output
        ob_start();

        // Check if WooCommerce and WP Mail SMTP are active
        if (
            !is_plugin_active('woocommerce/woocommerce.php') ||
            !is_plugin_active('wp-mail-smtp/wp_mail_smtp.php')
        ) {
            deactivate_plugins(plugin_basename(__FILE__));

            $wga_woocommerce_plugin_path = 'woocommerce/woocommerce.php';
            $wga_activate_wc_url = wp_nonce_url(
                admin_url('plugins.php?action=activate&plugin=' . $wga_woocommerce_plugin_path),
                'activate-plugin_' . $wga_woocommerce_plugin_path
            );

            $wga_smtp_plugin_path = 'wp-mail-smtp/wp_mail_smtp.php';
            $wga_activate_smtp_url = wp_nonce_url(
                admin_url('plugins.php?action=activate&plugin=' . $wga_smtp_plugin_path),
                'activate-plugin_' . $wga_smtp_plugin_path
            );

            $message_parts = [];

            // WooCommerce message
            if (!is_plugin_active('woocommerce/woocommerce.php')) {
                $message_parts[] = sprintf(
                    'Woocommerce Email Template Customizer requires <strong>WooCommerce</strong> to be installed and activated.
                    <br><br>If WooCommerce is not installed, <a href="%s">Click here to install WooCommerce</a>.
                    <br>If WooCommerce is already installed, <a href="%s">Click here to activate WooCommerce</a>.',
                    esc_url(admin_url('plugin-install.php?s=woocommerce&tab=search&type=term')),
                    esc_url($wga_activate_wc_url)
                );
            }

            // WP Mail SMTP message
            if (!is_plugin_active('wp-mail-smtp/wp_mail_smtp.php')) {
                $message_parts[] = sprintf(
                    'Woocommerce Email Template Customizer also requires <strong>WP Mail SMTP</strong> to be installed and activated.
                    <br><br>If WP Mail SMTP is not installed, <a href="%s">Click here to install WP Mail SMTP</a>.
                    <br>If WP Mail SMTP is already installed, <a href="%s">Click here to activate WP Mail SMTP</a>.',
                    esc_url(admin_url('plugin-install.php?s=wp+mail+smtp&tab=search&type=term')),
                    esc_url($wga_activate_smtp_url)
                );
            }

            $final_message = implode('<br><br><hr><br>', $message_parts);

            wp_die(
                wp_kses_post($final_message),
                esc_html__('Plugin Activation Error', 'wc-email-template-customizer'),
                array('back_link' => true)
            );
        }

        // Create tables and insert data
        self::WETC_create_table();
        self::WETC_insert_data();
        flush_rewrite_rules();
        ob_end_clean();
    }  

    public static function deactivate() {
        flush_rewrite_rules();
    }

    public static function WETC_create_table() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

// Table 1: wetc_email_templates
$woo_email_templates = "{$wpdb->prefix}wetc_email_templates";
$sql_woo_email_templates = "CREATE TABLE IF NOT EXISTS $woo_email_templates (
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    email_template_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    recipient TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'publish',
    subject VARCHAR(255),
    html_content LONGTEXT,
    json_data LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    template_note TEXT,  
    priority INT(11) DEFAULT 0,
    PRIMARY KEY (id)
) $charset_collate;";

        // Table 2: woo_email_template_meta
        $woo_email_template_meta = "{$wpdb->prefix}woo_email_template";
        $sql_woo_email_template_meta = "CREATE TABLE IF NOT EXISTS $woo_email_template_meta (
            meta_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            template_id INT(11) UNSIGNED NOT NULL,
            meta_key VARCHAR(255) NOT NULL,
            meta_value TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (template_id) REFERENCES $woo_email_templates(id) ON DELETE CASCADE
        ) $charset_collate;";

        // Table 3: woo_email_analytics
        $wp_woo_email_analytics = "{$wpdb->prefix}woo_email_analytics";
        $sql_woo_email_analytics = "CREATE TABLE IF NOT EXISTS $wp_woo_email_analytics (
            id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            template_id INT(11) UNSIGNED NOT NULL,            
            emails_sent INT(11) NOT NULL DEFAULT 0,           
            emails_opened INT(11) NOT NULL DEFAULT 0,           
            emails_clicked INT(11) NOT NULL DEFAULT 0,        
            date_recorded DATE NOT NULL,                        
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_analytics_template_id (template_id),
            CONSTRAINT fk_analytics_template_id FOREIGN KEY (template_id) REFERENCES {$wpdb->prefix}wetc_email_templates(id) ON DELETE CASCADE
        ) $charset_collate;";

        // Table 4: woo_email_ab_tests
        $wp_woo_email_ab_tests = "{$wpdb->prefix}woo_email_ab_tests";
        $sql_woo_email_ab_tests = "CREATE TABLE IF NOT EXISTS $wp_woo_email_ab_tests (
            id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            template_id INT(11) UNSIGNED NOT NULL,             
            test_name VARCHAR(255) NOT NULL,                 
            variant ENUM('A','B') NOT NULL,                    
            variant_details TEXT,                              
            results TEXT,                                      
            start_date DATE NOT NULL,                           
            end_date DATE DEFAULT NULL,                        
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_ab_template_id (template_id),
            CONSTRAINT fk_ab_template_id FOREIGN KEY (template_id) REFERENCES {$wpdb->prefix}wetc_email_templates(id) ON DELETE CASCADE
        ) $charset_collate;";

        // Table 5: woo_plugin_licenses
        $wp_woo_plugin_licenses = "{$wpdb->prefix}woo_plugin_licenses";
        $sql_woo_plugin_licenses = "CREATE TABLE IF NOT EXISTS $wp_woo_plugin_licenses (
            id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            license_key VARCHAR(255) NOT NULL UNIQUE,          
            user_id INT(11) UNSIGNED NOT NULL,                  
            status ENUM('active','inactive','expired') DEFAULT 'inactive', 
            activation_date DATETIME DEFAULT NULL,         
            expiration_date DATETIME DEFAULT NULL,            
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Table 6: woo_email_logs
        $wp_woo_email_logs = "{$wpdb->prefix}woo_email_logs";
        $sql_woo_email_logs = "CREATE TABLE IF NOT EXISTS $wp_woo_email_logs (
            id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            order_id BIGINT(20) UNSIGNED DEFAULT NULL,
            template_id INT(11) UNSIGNED DEFAULT NULL,
            recipient VARCHAR(255) NOT NULL,
            subject TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'success',
            error_message TEXT DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_log_order_id (order_id),
            KEY idx_log_template_id (template_id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_woo_email_templates);
        dbDelta($sql_woo_email_template_meta);
        dbDelta($sql_woo_email_analytics);
        dbDelta($sql_woo_email_ab_tests);
        dbDelta($sql_woo_plugin_licenses);
        dbDelta($sql_woo_email_logs);

        // Insert data after table creation
        self::WETC_insert_data();
    }

    public static function WETC_insert_data() {
        global $wpdb;

        // Insert data into wetc_email_templates
        $woo_email_templates = "{$wpdb->prefix}wetc_email_templates";
        $admin_email = get_option('admin_email');
        
        $template_mappings = [
            [
                'name' => 'News Letter Template',
                'type' => 'new_user_registration',
                'json_file' => 'new_user_registration.json',
                'html_file' => 'new_user_registeration.html'
            ],
            [
                'name' => 'New Order Template',
                'type' => 'new_order_admin',
                'json_file' => 'new_order_admin.json',
                'html_file' => 'new_order_admin.html'
            ],
            [
                'name' => 'Fail Order Template Admin',
                'type' => 'failed_order_admin',
                'json_file' => 'failed_order_admin.json',
                'html_file' => 'failed_order_admin.html'
            ],
            [
                'name' => 'Cancel Order Template Admin',
                'type' => 'cancelled_order_admin',
                'json_file' => 'cancelled_order_admin.json',
                'html_file' => 'cancelled_order_admin.html'
            ],
            [
                'name' => 'Process Order Template',
                'type' => 'processing_order_customer',
                'json_file' => 'processing_order_customer.json',
                'html_file' => 'processing_order_customer.html'
            ],
            [
                'name' => 'Complete Order Template',
                'type' => 'completed_order_customer',
                'json_file' => 'completed_order_customer.json',
                'html_file' => 'completed_order_customer.html'
            ],
            [
                'name' => 'Refund Order Template Full',
                'type' => 'refunded_order_customer_full',
                'json_file' => 'refunded_order_customer_full.json',
                'html_file' => 'refunded_order_customer_full.html'
            ],
            [
                'name' => 'Invoice Template Paid',
                'type' => 'customer_invoice_paid',
                'json_file' => 'customer_invoice_paid.json',
                'html_file' => 'customer_invoice_paid.html'
            ],
            [
                'name' => 'Cancel Order Template Customer',
                'type' => 'cancelled_order_customer',
                'json_file' => 'cancelled_order_customer.json',
                'html_file' => 'cancelled_order_customer.html'
            ],
            [
                'name' => 'Invoice Template Pending',
                'type' => 'customer_invoice_pending',
                'json_file' => 'customer_invoice_pending.json',
                'html_file' => 'customer_invoice_pending.html'
            ],
            [
                'name' => 'Customer Note Template',
                'type' => 'customer_note',
                'json_file' => 'customer_note.json',
                'html_file' => 'customer_note.html'
            ],
            [
                'name' => 'Fail Order Template Customer',
                'type' => 'failed_order_customer',
                'json_file' => 'failed_order_customer.json',
                'html_file' => 'failed_order_customer.html'
            ],
            [
                'name' => 'On Hold Order Template',
                'type' => 'on_hold_order',
                'json_file' => 'on_hold_order.json',
                'html_file' => 'on_hold_order.html'
            ],
            [
                'name' => 'Refund Order Template Partial',
                'type' => 'refunded_order_customer_partial',
                'json_file' => 'refunded_order_customer_partial.json',
                'html_file' => 'refunded_order_customer_partial.html'
            ],
            [
                'name' => 'Reset Password Template',
                'type' => 'reset_password',
                'json_file' => 'reset_password.json',
                'html_file' => 'reset_password.html'
            ]
        ];

        foreach ($template_mappings as $mapping) {
            // Check if this specific template type already exists
            $existing_template = $wpdb->get_row($wpdb->prepare( // phpcs:ignore 
                "SELECT id, html_content FROM $woo_email_templates WHERE content_type = %s", // phpcs:ignore
                $mapping['type']
            ));

            $json_file_path = SMACK_WETC_PLUGIN_PATH . 'includes/templates_json/' . $mapping['json_file'];
            $html_file_path = SMACK_WETC_PLUGIN_PATH . 'includes/templates/' . $mapping['html_file'];
            
            $json_data = file_exists($json_file_path) ? file_get_contents($json_file_path) : null;
            $html_content = file_exists($html_file_path) ? file_get_contents($html_file_path) : null;

            if (!$existing_template) {
                // Insert if not exists
                $wpdb->insert( // phpcs:ignore
                    $woo_email_templates,
                    [
                        'email_template_name' => $mapping['name'],
                        'content_type' => $mapping['type'],
                        'recipient' => $admin_email,
                        'json_data' => $json_data,
                        'html_content' => $html_content,
                        'priority' => 0
                    ],
                    ['%s', '%s', '%s', '%s', '%s', '%d']
                );
            } elseif (empty($existing_template->html_content) && !empty($html_content)) {
                // Update if HTML is empty but file exists
                $wpdb->update( // phpcs:ignore
                    $woo_email_templates,
                    [
                        'html_content' => $html_content,
                        'json_data' => $json_data // Also update JSON if it was missing/null
                    ],
                    ['id' => $existing_template->id],
                    ['%s', '%s'],
                    ['%d']
                );
            }
        }
    }
}

WETC_Installer::get_instance();
?>