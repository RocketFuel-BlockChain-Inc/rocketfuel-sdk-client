<?php
if (!defined('ABSPATH')) {
    exit;
}

function rfwc_cart_has_age_restricted() {
    if (!function_exists('WC') || !WC()->cart) {
        return false;
    }

    foreach (WC()->cart->get_cart() as $item) {
        $product_id = $item['product_id'];
        if (get_post_meta($product_id, '_rkfl_age_restricted', true) === 'yes') {
            return true;
        }
    }
    return false;
}

function rfwc_is_product_age_verified($product_id) {
    if (!session_id()) {
        session_start();
    }

    return isset($_SESSION['rfwc_verified_products']) && in_array($product_id, $_SESSION['rfwc_verified_products']);
}
