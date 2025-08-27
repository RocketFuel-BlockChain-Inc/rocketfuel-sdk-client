<?php
if (!defined('ABSPATH')) {
    exit;
}

class RFWC_Age_Gate
{
    public static function init()
    {
        add_action('woocommerce_product_options_general_product_data', [__CLASS__, 'admin_field']);
        add_action('woocommerce_process_product_meta', [__CLASS__, 'save_admin']);
    }

    public static function admin_field()
    {
        woocommerce_wp_checkbox([
            'id' => '_rkfl_age_restricted',
            'label' => 'Age Restricted Product',
            'description' => 'Blur images and require age verification.'
        ]);
    }

    public static function save_admin($post_id)
    {
        update_post_meta(
            $post_id,
            '_rkfl_age_restricted',
            isset($_POST['_rkfl_age_restricted']) ? 'yes' : 'no'
        );
    }

}


/**
 * Check if the current product is age-restricted and if the user is verified.
 *
 * @param WC_Product|null $product Optional. WooCommerce product object. Defaults to global $product if null.
 * @return bool True if verified or product not restricted, false otherwise.
 */
function rfwc_is_user_verified_for_product($product = null) {
    if (!$product) {
        global $product;
    }
    if (!$product instanceof WC_Product) {
        return true; // No product or invalid product, allow by default
    }

    // Check if product is age restricted
    $is_restricted = get_post_meta($product->get_id(), '_rkfl_age_restricted', true) === 'yes';
    if (!$is_restricted) {
        return true; // Not restricted, so verified by default
    }

    // Check verification status
    $verified = false;
    if (is_user_logged_in()) {
        $verified = !!get_user_meta(get_current_user_id(), 'rfwc_age_verified', true);
    } else {
        if (!session_id()) {
            session_start();
        }
        $verified = !empty($_SESSION['rfwc_age_verified']) || (!empty($_COOKIE['rfwc_age_verified']) && $_COOKIE['rfwc_age_verified'] == '1');
    }

    return $verified;
}

// filter hook to replace image in shop and other page
add_filter('woocommerce_product_get_image', function($html, $product) {
    if (rfwc_is_user_verified_for_product($product)) {
        return $html;
    }
    $placeholder_src = 'https://media.istockphoto.com/id/894875560/vector/under-eighteen-prohibition-sign-in-crossed-out-red-circle-vector-icon.jpg?s=612x612&w=0&k=20&c=ZnSowrwGMJXVex2DdJKyd6JfgOL8RU6xR3I8seZje4A=';
    $html = preg_replace('/src=["\'][^"\']*["\']/', 'src="' . esc_url($placeholder_src) . '"', $html);
    $html = preg_replace('/href=["\'][^"\']*["\']/', 'href="' . esc_url($placeholder_src) . '"', $html);
    $html = preg_replace('/data-large_image=["\'][^"\']*["\']/', 'href="' . esc_url($placeholder_src) . '"', $html);
    $html = preg_replace('/srcset=["\'][^"\']*["\']/', 'href="' . esc_url($placeholder_src) . '"', $html);

    return $html;
}, 10, 2);

add_filter('woocommerce_single_product_image_thumbnail_html', function($html, $post_thumbnail_id) {
    global $product;
    if (rfwc_is_user_verified_for_product($product)) {
        return $html;
    }
    $placeholder_src = 'https://media.istockphoto.com/id/894875560/vector/under-eighteen-prohibition-sign-in-crossed-out-red-circle-vector-icon.jpg?s=612x612&w=0&k=20&c=ZnSowrwGMJXVex2DdJKyd6JfgOL8RU6xR3I8seZje4A=';
    $html = preg_replace('/src=["\'][^"\']*["\']/', 'src="' . esc_url($placeholder_src) . '"', $html);
    $html = preg_replace('/href=["\'][^"\']*["\']/', 'href="#"', $html);
    $html = preg_replace('/data-large_image=["\'][^"\']*["\']/', 'href="' . esc_url($placeholder_src) . '"', $html);
    $html = preg_replace('/srcset=["\'][^"\']*["\']/', 'href="' . esc_url($placeholder_src) . '"', $html);

    return $html;
}, 10, 2);

add_filter('woocommerce_loop_add_to_cart_link', function($button_html, $product) {
    if (rfwc_is_user_verified_for_product($product)) {
        return $button_html;
    }
    return '<div class="rkfl-age-verify-container">
                <button class="rkfl-age-verify" onclick="window.handleAgeVerification()">Verify your age</button>
            </div>';
}, 10, 2);

add_filter('woocommerce_single_product_zoom_enabled', function($flag) {
    global $product;
    if (rfwc_is_user_verified_for_product($product)) {
        return $flag;
    }
    return false;
});

add_filter('woocommerce_single_product_photoswipe_enabled', function($flag) {
    global $product;
    if (rfwc_is_user_verified_for_product($product)) {
        return $flag;
    }
    return false;
});

add_filter('woocommerce_is_purchasable', function($flag) {
    global $product;
    if (rfwc_is_user_verified_for_product($product)) {
        return $flag;
    }
    return false;
});
