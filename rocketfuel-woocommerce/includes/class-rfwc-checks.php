<?php
if (!defined('ABSPATH')) {
    exit;
}

class RFWC_Checks {
    public static function init() {
        add_action('admin_init', [__CLASS__, 'check']);
    }

    public static function check() {
        if (is_admin() && current_user_can('activate_plugins') && !class_exists('WooCommerce')) {
            add_action('admin_notices', [__CLASS__, 'notice']);
            deactivate_plugins(plugin_basename(dirname(dirname(__FILE__)) . '/rocketfuel-woocommerce.php'));
        }
    }

    public static function notice() {
        echo '<div class="notice notice-error"><p><strong>Rocketfuel WooCommerce</strong> requires WooCommerce to be installed and active.</p></div>';
    }
}
