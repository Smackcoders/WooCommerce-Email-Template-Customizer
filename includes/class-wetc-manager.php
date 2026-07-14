<?php

namespace SmackCoders\WETC;

if (!defined('ABSPATH')) {
    die;
}

if (!class_exists('WP_List_Table')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class Posts_List_Table extends \WP_List_Table {

    public function __construct() {
        parent::__construct([
            'singular' => 'post',
            'plural'   => 'posts',
            'ajax'     => false
        ]);

        $this->ensure_status_column();
        $this->process_bulk_action();
    }

    private function ensure_status_column() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wetc_email_templates';
        
        // Check for 'status' column
        // $row = $wpdb->get_results("SHOW COLUMNS FROM $table_name LIKE 'status'"); 
        // if (empty($row)) {
        //     $wpdb->query("ALTER TABLE $table_name ADD COLUMN status VARCHAR(20) DEFAULT 'publish'");
        // }

        // // Check for 'created_at' column
        // $row_date = $wpdb->get_results("SHOW COLUMNS FROM $table_name LIKE 'created_at'");
        // if (empty($row_date)) {
        //     $wpdb->query("ALTER TABLE $table_name ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
        // }

        // // Check for 'template_note' column
        // $row_note = $wpdb->get_results("SHOW COLUMNS FROM $table_name LIKE 'template_note'");
        // if (empty($row_note)) {
        //     $wpdb->query("ALTER TABLE $table_name ADD COLUMN template_note TEXT");
        // }
    }
  
    public function get_columns() {
        $columns = [
            'cb'                  => '<input type="checkbox" />', // Bulk actions
            'email_template_name' => __('Email subject', 'wc-email-template-customizer'),
            'content_type'        => __('Type', 'wc-email-template-customizer'),
            'recipient'           => __('Recipient', 'wc-email-template-customizer'),
            'note'                => __('Note', 'wc-email-template-customizer'),
            'date'                => __('Date', 'wc-email-template-customizer'),
        ];
        return $columns;
    }

    protected function get_sortable_columns() {
        return [
            'email_template_name' => ['email_template_name', false],
            'date'                => ['created_at', false], // Sortable by date
        ];
    }


    public function column_default($item, $column_name) {
        switch ($column_name) {
            case 'content_type':
            case 'recipient':
                return isset($item[$column_name]) ? esc_html($item[$column_name]) : '';
            case 'note':
                return isset($item['template_note']) && !empty($item['template_note']) ? esc_html($item['template_note']) : '-';
            case 'date':
                return $this->column_date($item);
            default:
                return ;
                // return print_r($item, true); // For debugging
        }
    }

    public function column_date($item) {
        $status_raw = !empty($item['status']) ? $item['status'] : 'publish';
        $status = ucfirst($status_raw);
        
        // The DB 'created_at' is usually UTC. We need to convert it to local time.
        $date_utc = !empty($item['created_at']) ? $item['created_at'] : current_time('mysql', 1);
        $date_local = get_date_from_gmt($date_utc);
        
        $formatted_date = date_i18n(get_option('date_format') . ' \a\t ' . get_option('time_format'), strtotime($date_local));
        
        $label = ($status_raw === 'draft') ? 'Last Modified' : 'Published';

        return sprintf(
            '%s<br><span title="%s">%s</span>',
            esc_html($label),
            esc_attr($formatted_date),
            esc_html($formatted_date)
        );
    }


    public function column_cb($item) {
        return sprintf(
            '<input type="checkbox" name="template[]" value="%s" />',
            $item['id']
        );
    }

    public function column_email_template_name($item) {
        // phpcs:disable WordPress.Security.NonceVerification.Recommended
        $current_status = isset($_REQUEST['template_status']) ? sanitize_text_field(wp_unslash($_REQUEST['template_status'])) : 'all';
        $actions = [];

        if ($current_status === 'trash') {
            $actions['restore'] = sprintf(
                '<a href="%s">%s</a>', 
                wp_nonce_url(admin_url('admin-post.php?action=wetc_restore_template&id=' . $item['id']), 'wetc_restore_template_' . $item['id']), 
                __('Restore', 'wc-email-template-customizer')
            );
            $actions['delete'] = sprintf(
                '<a href="%s" onclick="return confirm(\'are you sure?\');" class="submitdelete">%s</a>', 
                wp_nonce_url(admin_url('admin-post.php?action=wetc_delete_template&id=' . $item['id']), 'wetc_delete_template_' . $item['id']), 
                __('Delete Permanently', 'wc-email-template-customizer')
            );
        } else {
            $actions['edit'] = sprintf('<a href="%s">%s</a>', admin_url('admin.php?page=email-customizer-add-new&id=' . $item['id']), __('Edit', 'wc-email-template-customizer'));
            $actions['duplicate'] = sprintf('<a href="%s">%s</a>', wp_nonce_url(admin_url('admin-post.php?action=wetc_duplicate_template&id=' . $item['id']), 'wetc_duplicate_template_' . $item['id']), __('Duplicate', 'wc-email-template-customizer'));
            $actions['trash'] = sprintf(
                '<a href="%s" class="submitdelete">%s</a>', 
                wp_nonce_url(admin_url('admin-post.php?action=wetc_trash_template&id=' . $item['id']), 'wetc_trash_template_' . $item['id']), 
                __('Trash', 'wc-email-template-customizer')
            );
        }

        $status_label = '';
        if (isset($item['status']) && $item['status'] === 'draft') {
            $status_label = ' — <span class="post-state">' . __('Draft', 'wc-email-template-customizer') . '</span>';
        }

        return sprintf('%1$s %2$s',
            '<strong><a class="row-title" href="' . admin_url('admin.php?page=email-customizer-add-new&id=' . $item['id']) . '">' . esc_html($item['email_template_name']) . '</a></strong>' . $status_label,
            $this->row_actions($actions)
        );
        // phpcs:enable WordPress.Security.NonceVerification.Recommended
    }

    public function get_bulk_actions() {
    // phpcs:disable WordPress.Security.NonceVerification.Recommended
        $status = isset($_REQUEST['template_status']) ? sanitize_text_field(wp_unslash($_REQUEST['template_status'])) : 'all';
        
        if ($status === 'trash') {
            return [
                'untrash' => __('Restore', 'wc-email-template-customizer'),
                'delete'  => __('Delete Permanently', 'wc-email-template-customizer')
            ];
        } else {
            return [
                'trash' => __('Move to Trash', 'wc-email-template-customizer')
            ];
        }
    // phpcs:enable WordPress.Security.NonceVerification.Recommended
    }

    public function get_views() {
        // phpcs:disable WordPress.Security.NonceVerification.Recommended
        global $wpdb;
        $table_name = $wpdb->prefix . 'wetc_email_templates';
        
        // Count statuses
        $stats = $wpdb->get_results("SELECT status, COUNT(*) as num FROM $table_name GROUP BY status", ARRAY_A); // phpcs:ignore
        $counts = ['publish' => 0, 'draft' => 0, 'trash' => 0];
        foreach ($stats as $row) {
             $s = !empty($row['status']) ? $row['status'] : 'publish';
             if (isset($counts[$s])) {
                 $counts[$s] += $row['num'];
             } else {
                 $counts['publish'] += $row['num']; // aggregate unknown as publish
             }
        }
        
        $total_active = $counts['publish'] + $counts['draft'];
        $total_published = $counts['publish'];
        $total_drafts = $counts['draft'];
        $total_trash = $counts['trash'];
        $current = !isset($_REQUEST['template_status']) ? 'all' : sanitize_text_field(wp_unslash($_REQUEST['template_status']));
        
        $views = [
            'all' => sprintf('<a href="%s" %s>%s <span class="count">(%d)</span></a>', remove_query_arg(['template_status', 'filter_type']), ($current === 'all' || $current === '') ? 'class="current"' : '', __('All', 'wc-email-template-customizer'), $total_active),
            'publish' => sprintf('<a href="%s" %s>%s <span class="count">(%d)</span></a>', add_query_arg('template_status', 'publish'), ($current === 'publish') ? 'class="current"' : '', __('Published', 'wc-email-template-customizer'), $total_published),
            'draft' => sprintf('<a href="%s" %s>%s <span class="count">(%d)</span></a>', add_query_arg('template_status', 'draft'), ($current === 'draft') ? 'class="current"' : '', __('Drafts', 'wc-email-template-customizer'), $total_drafts),
            'trash' => sprintf('<a href="%s" %s>%s <span class="count">(%d)</span></a>', add_query_arg('template_status', 'trash'), ($current === 'trash') ? 'class="current"' : '', __('Trash', 'wc-email-template-customizer'), $total_trash)
        ];

        return $views;
        // phpcs:enable WordPress.Security.NonceVerification.Recommended
    }

    public function extra_tablenav($which) {
        // phpcs:disable WordPress.Security.NonceVerification.Recommended
        if ($which == 'top') {
            $current_type = isset($_GET['filter_type']) ? sanitize_text_field(wp_unslash($_GET['filter_type'])) : '';
            
            // Get all unique types
            global $wpdb;
            $table_name = $wpdb->prefix . 'wetc_email_templates';
            $types = $wpdb->get_col("SELECT DISTINCT content_type FROM $table_name ORDER BY content_type ASC"); // phpcs:ignore
            
            echo '<div class="alignleft actions">';
            
            // Type Filter
            echo '<select name="filter_type">';
            echo '<option value="">' . esc_html__('Filter by type', 'wc-email-template-customizer') . '</option>';
            foreach ($types as $type) {
                printf(
                    '<option value="%s" %s>%s</option>',
                    esc_attr($type),
                    selected($current_type, $type, false),
                    esc_html(ucwords(str_replace('_', ' ', $type)))
                );
            }
            echo '</select>';

            submit_button(esc_html__('Filter','wc-email-template-customizer'), 'secondary', false, false);
            echo '</div>';
        }
        // phpcs:enable WordPress.Security.NonceVerification.Recommended
    }

    public function prepare_items() {
        // phpcs:disable WordPress.Security.NonceVerification.Recommended
        global $wpdb;

        $table_name = $wpdb->prefix . 'wetc_email_templates';
        $per_page = $this->get_items_per_page('wetc_templates_per_page', 20);
        
        $columns = $this->get_columns();
        $hidden = [];
        $sortable = $this->get_sortable_columns();
        
        $this->_column_headers = [$columns, $hidden, $sortable];

        // Process Bulk Actions
        $this->process_bulk_action();

        // Pagination parameters
        $current_page = $this->get_pagenum();
        $offset = ($current_page - 1) * $per_page;

        // Sorting
        $orderby = (isset($_GET['orderby'])) ? sanitize_sql_orderby(wp_unslash($_GET['orderby'])) : 'id';
        $order = (isset($_GET['order'])) ? sanitize_text_field(wp_unslash($_GET['order'])) : 'DESC';

        // Filters
        $where = "WHERE 1=1";
        
        // Search
        if (!empty($_REQUEST['s'])) {
            $search = esc_sql(sanitize_text_field(wp_unslash($_REQUEST['s'])));
            $where .= " AND email_template_name LIKE '%{$search}%'";
        }
        
        // Type Filter
        if (!empty($_REQUEST['filter_type'])) {
            $type = esc_sql(sanitize_text_field(wp_unslash($_REQUEST['filter_type'])));
            $where .= " AND content_type = '{$type}'";
        }

        // Status Filter
        $status_filter = isset($_REQUEST['template_status']) ? sanitize_text_field(wp_unslash($_REQUEST['template_status'])) : 'all';
        
        if ($status_filter === 'trash') {
            $where .= " AND status = 'trash'";
        } elseif ($status_filter === 'publish') {
            $where .= " AND (status = 'publish' OR status IS NULL OR status = '')";
        } elseif ($status_filter === 'draft') {
            $where .= " AND status = 'draft'";
        } else {
            // All view: Show everything except trash
            $where .= " AND (status != 'trash' OR status IS NULL OR status = '')";
        }

        // Get Total Count
        $total_items = $wpdb->get_var("SELECT COUNT(id) FROM $table_name $where"); // phpcs:ignore

        // Get Items
        $this->items = $wpdb->get_results( // phpcs:ignore
            "SELECT * FROM $table_name $where ORDER BY $orderby $order LIMIT $per_page OFFSET $offset", // phpcs:ignore
            ARRAY_A
        );

        $this->set_pagination_args([
            'total_items' => $total_items,
            'per_page'    => $per_page,
            'total_pages' => ceil($total_items / $per_page)
        ]);
        // phpcs:enable WordPress.Security.NonceVerification.Recommended
    }

    public function process_bulk_action() {
        // phpcs:disable WordPress.Security.NonceVerification.Recommended
        global $wpdb;
        $table_name = $wpdb->prefix . 'wetc_email_templates';
        $action = $this->current_action();

        if (!$action) return;

        if (isset($_REQUEST['template']) && is_array($_REQUEST['template'])) {
            $ids = array_map('intval', $_REQUEST['template']);
            $ids_sql = implode(',', $ids);

            if ($action === 'trash') {
                 $wpdb->query("UPDATE $table_name SET status = 'trash' WHERE id IN ($ids_sql)"); // phpcs:ignore
            } elseif ($action === 'untrash') {
                 $wpdb->query("UPDATE $table_name SET status = 'publish' WHERE id IN ($ids_sql)"); // phpcs:ignore
            } elseif ($action === 'delete') {
                 $wpdb->query("DELETE FROM $table_name WHERE id IN ($ids_sql)"); // phpcs:ignore
            }
        }
        // phpcs:enable WordPress.Security.NonceVerification.Recommended
    }
}
