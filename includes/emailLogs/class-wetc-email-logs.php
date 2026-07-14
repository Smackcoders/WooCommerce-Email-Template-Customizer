<?php

namespace SmackCoders\WETC\EmailLogs;

if (!defined('ABSPATH')) {
    die;
}

if (!class_exists('WP_List_Table')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class WETC_Email_Logs_Table extends \WP_List_Table {

    public function __construct() {
        parent::__construct([
            'singular' => 'log',
            'plural'   => 'logs',
            'ajax'     => false,
            'screen'   => isset($_REQUEST['page']) && $_REQUEST['page'] === 'wetc-email-log' ? 'email-template-customizer_page_wetc-email-log' : null
        ]);
        $this->ensure_is_opened_column();
    }

    private function ensure_is_opened_column() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'woo_email_logs';
        $row = $wpdb->get_results("SHOW COLUMNS FROM $table_name LIKE 'is_opened'"); 
        if (empty($row)) {
            $wpdb->query("ALTER TABLE $table_name ADD COLUMN is_opened TINYINT(1) DEFAULT 0");
        }
    }

    public function get_columns() {
        return [
            'cb'            => '<input type="checkbox" />',
            'order_id'      => __('Order ID', 'wc-email-template-customizer'),
            'recipient'     => __('Recipient', 'wc-email-template-customizer'),
            'subject'       => __('Subject', 'wc-email-template-customizer'),
            'email_type'    => __('Email Type', 'wc-email-template-customizer'),
            'is_opened'     => __('Opened', 'wc-email-template-customizer'),
            'status'        => __('Status', 'wc-email-template-customizer'),
            'created_at'    => __('Date', 'wc-email-template-customizer'),
        ];
    }

    protected function get_sortable_columns() {
        return [
            'created_at' => ['created_at', false],
            'status'     => ['status', false],
        ];
    }

    public function column_default($item, $column_name) {
        switch ($column_name) {
            case 'order_id':
                if ($item['order_id']) {
                    return sprintf(
                        '<a href="%s">#%s</a>',
                        admin_url('post.php?post=' . absint($item['order_id']) . '&action=edit'),
                        esc_html($item['order_id'])
                    );
                }
                return '-';
            case 'recipient':
            case 'subject':
                return esc_html($item[$column_name]);
            case 'status':
                $status = $item['status'];
                $class = $status === 'success' ? 'notice-success' : 'notice-error';
                $style = $status === 'success' ? 'color: #46b450;' : 'color: #dc3232;';
                $title = $item['error_message'] ? ' title="' . esc_attr($item['error_message']) . '"' : '';
                return sprintf('<span style="font-weight: bold; %s"%s>%s</span>', $style, $title, strtoupper($status));
            case 'email_type':
                if (!empty($item['email_type'])) {
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
                    return isset($slug_to_name_map[$item['email_type']]) ? $slug_to_name_map[$item['email_type']] : ucwords(str_replace('_', ' ', $item['email_type']));
                }
                return '-';
            case 'is_opened':
                return !empty($item['is_opened']) ? '<span style="color:#46b450;font-weight:bold;">Yes</span>' : '<span style="color:#777;">No</span>';
            case 'created_at':
                return date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($item['created_at']));
            default:
                return isset($item[$column_name]) ? esc_html($item[$column_name]) : '';
        }
    }

    public function column_cb($item) {
        return sprintf(
            '<input type="checkbox" name="log[]" value="%s" />',
            $item['id']
        );
    }

    protected function pagination($which) {
        if ($which === 'top') {
            return;
        }
        parent::pagination($which);
    }

    protected function bulk_actions($which = '') {
        if ($which === 'bottom') {
            return;
        }
        parent::bulk_actions($which);
    }

    public function extra_tablenav($which) {
        if ($which !== 'top') {
            return;
        }

        global $wpdb;

        // Fetch Email Types for filter
        $table_templates = $wpdb->prefix . 'wetc_email_templates';
        $email_types = $wpdb->get_col("SELECT DISTINCT content_type FROM $table_templates WHERE content_type != ''");
        
        $selected_type = isset($_GET['filter_email_type']) ? sanitize_text_field(wp_unslash($_GET['filter_email_type'])) : '';
        $start_date = isset($_GET['filter_start_date']) ? sanitize_text_field(wp_unslash($_GET['filter_start_date'])) : '';
        $end_date = isset($_GET['filter_end_date']) ? sanitize_text_field(wp_unslash($_GET['filter_end_date'])) : '';
        $selected_cat = isset($_GET['filter_product_cat']) ? absint(wp_unslash($_GET['filter_product_cat'])) : 0;

        $product_categories = get_terms([
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
        ]);

        echo '<div class="alignleft actions">';
        
        // Email Type Filter
        if (!empty($email_types)) {
            echo '<select name="filter_email_type">';
            echo '<option value="">' . esc_html__('All Email Types', 'wc-email-template-customizer') . '</option>';
            foreach ($email_types as $type) {
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
                $name = isset($slug_to_name_map[$type]) ? $slug_to_name_map[$type] : ucwords(str_replace('_', ' ', $type));
                printf(
                    '<option value="%s"%s>%s</option>',
                    esc_attr($type),
                    selected($selected_type, $type, false),
                    esc_html($name)
                );
            }
            echo '</select>';
        }

        // Product Category Filter
        if (!is_wp_error($product_categories) && !empty($product_categories)) {
            echo '<select name="filter_product_cat">';
            echo '<option value="0">' . esc_html__('All Product Categories', 'wc-email-template-customizer') . '</option>';
            foreach ($product_categories as $cat) {
                printf(
                    '<option value="%d"%s>%s</option>',
                    $cat->term_id,
                    selected($selected_cat, $cat->term_id, false),
                    esc_html($cat->name)
                );
            }
            echo '</select>';
        }

        // Date Filters
        echo '<input type="date" name="filter_start_date" value="' . esc_attr($start_date) . '" placeholder="Start Date" />';
        echo '<input type="date" name="filter_end_date" value="' . esc_attr($end_date) . '" placeholder="End Date" />';

        submit_button(__('Filter', 'wc-email-template-customizer'), 'button', 'filter_action', false, ['id' => 'post-query-submit']);
        echo '</div>';
    }

    public function prepare_items() {
        // phpcs:disable WordPress.Security.NonceVerification.Recommended
        global $wpdb;
        $table_name = $wpdb->prefix . 'woo_email_logs';
        $table_templates = $wpdb->prefix . 'wetc_email_templates';

        $per_page = $this->get_items_per_page('wetc_logs_per_page', 20);
        $columns = $this->get_columns();
        $hidden = [];
        $sortable = $this->get_sortable_columns();
        $this->_column_headers = [$columns, $hidden, $sortable];

        $current_page = $this->get_pagenum();
        $offset = ($current_page - 1) * $per_page;

        $orderby = (isset($_GET['orderby'])) ? sanitize_sql_orderby(wp_unslash($_GET['orderby'])) : 'id';
        $order = (isset($_GET['order'])) ? sanitize_text_field(wp_unslash($_GET['order'])) : 'DESC';

        $where_clauses = ["1=1"];
        $query_args = [];

        if (!empty($_REQUEST['s'])) {
            $search = '%' . $wpdb->esc_like(sanitize_text_field(wp_unslash($_REQUEST['s']))) . '%';
            $where_clauses[] = "(l.recipient LIKE %s OR l.subject LIKE %s OR l.order_id LIKE %s)";
            $query_args[] = $search;
            $query_args[] = $search;
            $query_args[] = $search;
        }

        // Apply filters
        if (!empty($_GET['filter_email_type'])) {
            $where_clauses[] = "t.content_type = %s";
            $query_args[] = sanitize_text_field(wp_unslash($_GET['filter_email_type']));
        }

        if (!empty($_GET['filter_start_date'])) {
            $where_clauses[] = "DATE(l.created_at) >= %s";
            $query_args[] = sanitize_text_field(wp_unslash($_GET['filter_start_date']));
        }

        if (!empty($_GET['filter_end_date'])) {
            $where_clauses[] = "DATE(l.created_at) <= %s";
            $query_args[] = sanitize_text_field(wp_unslash($_GET['filter_end_date']));
        }

        if (!empty($_GET['filter_product_cat'])) {
            $cat_id = absint(wp_unslash($_GET['filter_product_cat']));
            $where_clauses[] = "l.order_id IN (
                SELECT woi.order_id 
                FROM {$wpdb->prefix}woocommerce_order_items woi
                JOIN {$wpdb->prefix}woocommerce_order_itemmeta woim ON woi.order_item_id = woim.order_item_id
                JOIN {$wpdb->term_relationships} tr ON tr.object_id = woim.meta_value
                JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
                WHERE woi.order_item_type = 'line_item'
                  AND woim.meta_key = '_product_id'
                  AND tt.term_id = %d
                  AND tt.taxonomy = 'product_cat'
            )";
            $query_args[] = $cat_id;
        }

        $where_sql = "WHERE " . implode(' AND ', $where_clauses);

        // First prep total items query
        $total_sql = "SELECT COUNT(l.id) FROM $table_name l LEFT JOIN $table_templates t ON l.template_id = t.id $where_sql";
        if (!empty($query_args)) {
            $total_sql = $wpdb->prepare($total_sql, ...$query_args);
        }
        $total_items = $wpdb->get_var($total_sql); // phpcs:ignore

        // Next prep main items query
        $main_sql = "SELECT l.*, t.content_type as email_type FROM $table_name l LEFT JOIN $table_templates t ON l.template_id = t.id $where_sql ORDER BY l.$orderby $order LIMIT %d OFFSET %d";
        $main_query_args = $query_args;
        $main_query_args[] = $per_page;
        $main_query_args[] = $offset;
        
        $main_sql = $wpdb->prepare($main_sql, ...$main_query_args);
        
        $this->items = $wpdb->get_results($main_sql, ARRAY_A); // phpcs:ignore

        $this->set_pagination_args([
            'total_items' => $total_items,
            'per_page'    => $per_page,
            'total_pages' => ceil($total_items / $per_page)
        ]);
        // phpcs:enable WordPress.Security.NonceVerification.Recommended
    }

    public function get_bulk_actions() {
        return [
            'bulk-delete' => __('Delete', 'wc-email-template-customizer')
        ];
    }

    public function handle_bulk_delete_logs() {
        if (!isset($_GET['_wpnonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'bulk-' . $this->_args['plural'])) {
            return;
        }

        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.','wc-email-template-customizer'));
        }

        if (isset($_GET['log']) && is_array($_GET['log'])) {
            global $wpdb;
            $table_name = $wpdb->prefix . 'woo_email_logs';
            $ids = array_map('intval', $_GET['log']);
            $placeholders = implode(',', array_fill(0, count($ids), '%d'));
            $wpdb->query($wpdb->prepare("DELETE FROM $table_name WHERE id IN ($placeholders)", ...$ids));// phpcs:ignore 
        }

        wp_safe_redirect(admin_url('admin.php?page=wetc-email-log'));
        exit;
    }

    public static function render_page() {
        $log_table = new self();
        
        // Handle bulk actions
        $action = $log_table->current_action();
        if ($action === 'bulk-delete') {
            $log_table->handle_bulk_delete_logs();
        }

        $log_table->prepare_items();
        ?>
        <div class="wrap wetc-email-log-wrap">
            <h1 class="wp-heading-inline"><?php esc_html_e('Email Log', 'wc-email-template-customizer'); ?></h1>
            <hr class="wp-header-end">
            <form method="get">
                <input type="hidden" name="page" value="wetc-email-log" />
                <?php
                $log_table->search_box(__('Search Logs', 'wc-email-template-customizer'), 'search_id');
                $log_table->display();
                ?>
            </form>
        </div>
        <?php
    }
}
