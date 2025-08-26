<?php 
// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


add_action('wp_enqueue_scripts', 'enqueue_custom_checkout_script');
function enqueue_custom_checkout_script() {
    if ( is_checkout() ) {
        wp_enqueue_script(
            'custom-checkout-button-script',
            plugins_url('block/place-order.js', __FILE__),
            array('wc-checkout-block-data'), // 'wc-checkout-block-data' is required for `registerCheckoutFilters`
            '1.0.0',
            true
        );
    }
}