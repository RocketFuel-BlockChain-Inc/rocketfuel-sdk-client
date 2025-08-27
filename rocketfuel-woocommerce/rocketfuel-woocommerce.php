<?php
/**
 * Plugin Name: Rocketfuel WooCommerce
 * Description: Integrates Rocketfuel SDK for Age Verification & Payment.
 * Version: 1.0.2
 * Author: Your Name
 */
if (!defined('ABSPATH')) {
    exit;
}


define('RFWC_VERSION', '1.0.2');
define('RFWC_PATH', plugin_dir_path(__FILE__));
define('RFWC_URL', plugin_dir_url(__FILE__));

// logger
function rfwc_log($message)
{
    if (is_array($message) || is_object($message)) {
        $message = print_r($message, true);
    }
    $log_file = plugin_dir_path(__FILE__) . 'rocketfuel-debug.log';
    error_log(date('[Y-m-d H:i:s] ') . $message . PHP_EOL, 3, $log_file);
}

// Usage example inside constructor

require_once RFWC_PATH . 'includes/class-rfwc-gateway.php';
require_once RFWC_PATH . 'includes/class-rfwc-checks.php';
require_once RFWC_PATH . 'includes/class-rfwc-settings.php';
require_once RFWC_PATH . 'includes/class-rfwc-age-gate.php';
require_once RFWC_PATH . 'includes/class-rfwc-assets.php';
require_once RFWC_PATH . 'includes/class-rfwc-ajax.php';
require_once RFWC_PATH . 'includes/helpers.php';

add_action('init', function () {
    if (!session_id()) {
        session_start();
    }
    // Only bootstrap for REST requests (optional check).
    if (defined('REST_REQUEST') && REST_REQUEST) {
        if (class_exists('WC_Session_Handler')) {
            // Initialize WC session
            WC()->session = new WC_Session_Handler();
            WC()->session->init();
        }
        if (class_exists('WC_Customer')) {
            // Initialize WC customer
            WC()->customer = new WC_Customer(get_current_user_id(), true);
        }
        if (class_exists('WC_Cart')) {
            // Initialize WC cart
            WC()->cart = new WC_Cart();
            WC()->cart->get_cart();
        }
    }
}, 5);

add_action('plugins_loaded', function () {
    if (!class_exists('WooCommerce')) {
        return;
    }

    // Initialize your modules
    RFWC_Settings::init();
    RFWC_Age_Gate::init();
    RFWC_Assets::init();
    RFWC_Checks::init();
    add_filter('woocommerce_payment_gateways', function ($methods) {
        $methods[] = 'WC_Rocketfuel_Gateway';
        return $methods;
    });

}, 20);

// Register REST routes
add_action('rest_api_init', ['RFWC_Ajax', 'register_rest_routes']);

add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
    array_unshift($links, '<a href="admin.php?page=rfwc-settings">Settings</a>');
    return $links;
});