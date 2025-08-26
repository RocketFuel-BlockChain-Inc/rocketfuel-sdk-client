<?php
if (!defined('ABSPATH')) {
    exit;
}

class RFWC_Age_Gate {
    public static function init() {
        add_action('woocommerce_product_options_general_product_data', [__CLASS__, 'admin_field']);
        add_action('woocommerce_process_product_meta', [__CLASS__, 'save_admin']);
        add_action('woocommerce_after_shop_loop_item', [__CLASS__, 'inject_verify'], 1);
        add_action('woocommerce_single_product_summary', [__CLASS__, 'inject_verify'], 1);
        add_action('wp_enqueue_scripts', [__CLASS__, 'add_blur_css']);
    }

    public static function admin_field() {
        woocommerce_wp_checkbox([
            'id' => '_rkfl_age_restricted',
            'label' => 'Age Restricted Product',
            'description' => 'Blur images and require age verification before purchase.'
        ]);
    }

    public static function save_admin($post_id) {
        $is_restricted = isset($_POST['_rkfl_age_restricted']) ? 'yes' : 'no';
        update_post_meta($post_id, '_rkfl_age_restricted', $is_restricted);
    }

    public static function add_blur_css() {
        if (is_product() || is_shop() || is_product_category() || is_product_tag()) {
            echo '<style>
                .rkfl-age-restricted:not(.verified) .woocommerce-product-gallery__image img,
                .rkfl-age-restricted:not(.verified) .attachment-woocommerce_thumbnail {
                    filter: blur(10px) !important;
                }
                .woocommerce-loop-product__link .rkfl-age-restricted:not(.verified) img {
                    filter: blur(10px) !important;
                }
            </style>';
        }
    }
    
    public static function inject_verify() {
        global $product;
        if (!$product) return;

        if (get_post_meta($product->get_id(), '_rkfl_age_restricted', true) === 'yes') {
            echo '<script>
                document.addEventListener("DOMContentLoaded", function() {
                    var productContainer = document.querySelector(".woocommerce-product-gallery") || document.querySelector(".woocommerce-loop-product__link");
                    if (productContainer && !productContainer.classList.contains("rkfl-age-restricted")) {
                        productContainer.classList.add("rkfl-age-restricted");
                        productContainer.setAttribute("data-product-id", "' . esc_attr($product->get_id()) . '");
                    }
                    var addToCartBtns = document.querySelectorAll(".add_to_cart_button, .single_add_to_cart_button");
                    addToCartBtns.forEach(function(btn) {
                        if (btn.closest(".rkfl-age-restricted")) {
                            btn.style.display = "none";
                        }
                    });
                });
            </script>';
            echo '<div class="rkfl-age-verify-container">';
            echo '<button class="button rkfl-age-verify" data-product-id="' . esc_attr($product->get_id()) . '">Verify your age</button>';
            echo '</div>';
        }
    }
}
