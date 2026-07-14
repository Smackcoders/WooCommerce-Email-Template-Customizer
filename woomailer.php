<?php
/**
 * WooCommerce Email Template Customizer.
 *
 * Plugin for customizing WooCommerce email templates and syncing store data with Mailchimp.
 *
 * @package   Smackcoders\WCETC
 * @copyright Copyright (C) 2010-2025, Smackcoders Inc - info@smackcoders.com
 * @license   https://www.gnu.org/licenses/gpl-3.0.html GNU General Public License, version 3 or higher
 *
 * @wordpress-plugin
 * Plugin Name: WooCommerce Email Template Customizer
 * Version:     1.0.0
 * Plugin URI:  https://www.smackcoders.com
 * Description: Connect WooCommerce to Mailchimp and customize email templates. Sync your store data, send targeted campaigns, and sell more with beautifully branded emails.
 * Author:      Smackcoders
 * Author URI:  https://www.smackcoders.com/wordpress.html
 * Text Domain: wc-email-template-customizer
 * Domain Path: /languages
 * License:     GPLv2
 */

namespace SmackCoders\WETC;

if (!defined('ABSPATH')) {
    die;
}

define('SMACK_WETC_PLUGIN_VERSION', '1.0.0');
define('SMACK_WETC_PLUGIN_NAME', 'Woocommerce Email Customizer');
define('SMACK_WETC_PLUGIN_SLUG', 'sm-mail-customizer');
define('SMACK_WETC_PLUGIN_FILE', __FILE__);
define('SMACK_WETC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SMACK_WETC_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('SMACK_WETC_PLUGIN_ADMIN_URL', admin_url('admin.php?page=sm-mail-customizer'));
define('SMACK_WETC_PLUGIN_ASSETS_URL', plugin_dir_url(__FILE__) . 'assets/');
define('SMACK_WETC_PLUGIN_WP_LIST_TABLE', ABSPATH . 'wp-admin/includes/class-wp-list-table.php');

require_once SMACK_WETC_PLUGIN_PATH . 'includes/installation/install.php';
require_once SMACK_WETC_PLUGIN_PATH . 'includes/class-wetc-connector.php';
require_once SMACK_WETC_PLUGIN_PATH . 'includes/class-wetc-ai-handler.php';
require_once SMACK_WETC_PLUGIN_PATH . 'includes/helper/functions.php';

if (!class_exists('WP_List_Table')) {
    require_once SMACK_WETC_PLUGIN_WP_LIST_TABLE;
}


use SmackCoders\WETC\WETC_Installer;
use SmackCoders\WETC\WETC_Connector;

register_activation_hook(__FILE__, ['SmackCoders\WETC\WETC_Installer', 'activate']);
register_deactivation_hook(__FILE__, ['SmackCoders\WETC\WETC_Installer', 'deactivate']);

WETC_Installer::get_instance();
WETC_Connector::get_instance();
WETC_Email_Handler::get_instance();
WETC_AI_Handler::get_instance();


?>
