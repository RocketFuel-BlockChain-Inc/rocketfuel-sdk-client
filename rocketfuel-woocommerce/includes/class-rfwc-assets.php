<?php
if (!defined('ABSPATH')) {
    exit;
}

class RFWC_Assets
{
    public static function init()
    {
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue']);
    }

    public static function enqueue()
    {
        if (!class_exists('WooCommerce'))
            return;

        wp_enqueue_style('rfwc-style', RFWC_URL . 'assets/css/rfwc.css', [], RFWC_VERSION);
        wp_enqueue_script('rkfl-sdk', 'https://rocketfuel-sdk.netlify.app/rkfl-transact-client.min-0.0.1.js', [], null, true);
        wp_enqueue_script('rfwc-frontend', RFWC_URL . 'assets/js/rfwc.js', ['jquery', 'rkfl-sdk'], RFWC_VERSION, true);
        wp_register_script(
            'wc-rocketfuel-blocks-integration',
            RFWC_URL . 'assets/js/checkout.js',
            ['rfwc-frontend', 'wc-blocks-registry', 'wp-element', 'wp-html-entities', 'wp-i18n'],
            null,
            true
        );
        wp_register_script(
            'wc-rocketfuel-place-order',
            RFWC_URL . 'assets/js/place-order.js',
            ['wc-blocks-registry', 'wp-element', 'wp-html-entities', 'wp-i18n', 'rfwc-frontend'],
            null,
            true
        );
        $options = get_option('rfwc_options', []);
        wp_localize_script('rfwc-frontend', 'rkflSettings', [
            'clientId' => $options['client_id'] ?? '',
            'merchantId' => $options['merchant_id'] ?? '',
            'environment' => $options['environment'] ?? 'qa',
            'redirect' => !empty($options['redirect']),
            'restUrl' => esc_url(rest_url('rkfl/v1')),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('rfwc_nonce'),
        ]);
    }

}
