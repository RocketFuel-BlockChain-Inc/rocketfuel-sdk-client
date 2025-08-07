<?php
/**
 * Plugin Name: Rocketfuel SDK Payment Gateway
 * Description: WooCommerce payment gateway with Rocketfuel SDK age verification. Blocks add-to-cart until age verified. Only product images blurred. Server-aware verification with reset.
 * Version: 2.1
 * Author: Rocketfuel Inc.
 */

if (!defined('ABSPATH')) {
    exit;
}

// Start PHP session early
add_action('init', function () {
    if (!session_id()) {
        session_start();
    }
});

// Server-side check if user session age verified
function is_user_age_verified() {
    if (!session_id()) {
        session_start();
    }
    return !empty($_SESSION['rkfl_age_verified']);
}

// AJAX handler to set age verified flag in session
add_action('wp_ajax_rkfl_set_age_verified', 'rkfl_set_age_verified');
add_action('wp_ajax_nopriv_rkfl_set_age_verified', 'rkfl_set_age_verified');
function rkfl_set_age_verified() {
    if (!session_id()) {
        session_start();
    }
    $_SESSION['rkfl_age_verified'] = true;
    wp_send_json_success();
}

// AJAX handler to clear age verified flag in session (for reset)
add_action('wp_ajax_rkfl_clear_age_verified', 'rkfl_clear_age_verified');
add_action('wp_ajax_nopriv_rkfl_clear_age_verified', 'rkfl_clear_age_verified');
function rkfl_clear_age_verified() {
    if (!session_id()) {
        session_start();
    }
    unset($_SESSION['rkfl_age_verified']);
    wp_send_json_success();
}

// Register Rocketfuel Gateway
add_filter('woocommerce_payment_gateways', 'rkfl_add_gateway_class');
function rkfl_add_gateway_class($gateways) {
    $gateways[] = 'WC_Rocketfuel_Gateway';
    return $gateways;
}

// Define Gateway class
add_action('plugins_loaded', 'rkfl_init_gateway_class');
function rkfl_init_gateway_class() {
    if (class_exists('WC_Payment_Gateway')) {
        class WC_Rocketfuel_Gateway extends WC_Payment_Gateway {
            public function __construct() {
                $this->id = 'rocketfuel_gateway';
                $this->has_fields = false;
                $this->method_title = 'Rocketfuel Payment';
                $this->method_description = 'Pay with Rocketfuel and use SDK age verification.';

                $this->init_form_fields();
                $this->init_settings();

                $this->enabled     = $this->get_option('enabled');
                $this->title       = $this->get_option('title');
                $this->client_id   = $this->get_option('client_id');
                $this->environment = $this->get_option('environment');

                add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
                add_action('wp_enqueue_scripts', [$this, 'enqueue_sdk_scripts']);
            }

            public function init_form_fields() {
                $this->form_fields = [
                    'enabled' => [
                        'title'   => 'Enable/Disable',
                        'type'    => 'checkbox',
                        'label'   => 'Enable Rocketfuel Gateway',
                        'default' => 'yes',
                    ],
                    'title' => [
                        'title'       => 'Title',
                        'type'        => 'text',
                        'description' => 'This controls the title seen during checkout.',
                        'default'     => 'Rocketfuel',
                        'desc_tip'    => true,
                    ],
                    'client_id' => [
                        'title'       => 'Client ID',
                        'type'        => 'text',
                        'description' => 'Your Rocketfuel client ID.',
                        'desc_tip'    => true,
                    ],
                    'environment' => [
                        'title'       => 'Environment',
                        'type'        => 'select',
                        'description' => 'Choose environment.',
                        'default'     => 'qa',
                        'options'     => [
                            'qa'      => 'QA',
                            'sandbox' => 'Sandbox',
                            'prod'    => 'Production',
                        ],
                    ],
                ];
            }

            public function enqueue_sdk_scripts() {
                if (!is_product() && !is_shop() && !is_product_category() && !is_product_tag()) {
                    return;
                }

                wp_enqueue_script(
                    'rkfl-sdk',
                    plugin_dir_url(__FILE__) . 'dist/rkfl-transact-client.min-0.0.1.js',
                    [],
                    '1.0.0',
                    true
                );

                wp_register_script('rkfl-frontend', '', [], null, true);

                // Localize data to JS: SDK clientId, environment, AJAX URL
                wp_localize_script('rkfl-frontend', 'rkflSettings', [
                    'clientId'    => $this->client_id,
                    'environment' => $this->environment,
                    'ajaxUrl'     => admin_url('admin-ajax.php'),
                ]);

                wp_enqueue_script('rkfl-frontend');

                // Inject inline JS handling SDK init, verification, UI updates, and reset
                wp_add_inline_script('rkfl-frontend', $this->get_frontend_js());

                // Inline CSS for blur effect and buttons
                wp_add_inline_style('woocommerce-inline', '
                button.rkfl-verify-age-btn {
                background-color: #007cba;
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.3s ease;
                display: inline-block;
                text-align: center;
            }

            .rkfl-verify-age-btn:disabled {
                background-color: #gray;
                cursor: not-allowed;
                opacity: 0.6;
            }

            .rkfl-verify-age-btn:not(:disabled):hover {
                background-color: #005f8d;
            }

                    .rkfl-blur-img-wrapper {
                        filter: blur(5px);
                        position: relative;
                        display: inline-block;
                        transition: filter 0.3s ease;
                    }
                    .rkfl-blur-img-wrapper::after {
                        content: "Age Restricted";
                        position: absolute;
                        top: 50%; left: 50%;
                        transform: translate(-50%, -50%);
                        background: rgba(0,0,0,0.7);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-weight: bold;
                        pointer-events: none;
                        white-space: nowrap;
                        font-size: 14px;
                    }
                    button.rkfl-verify-age-btn {
                        margin-top: 8px;
                        display: inline-block;
                        cursor: pointer;
                    }
                    .rkfl-age-msg {
                        color: red;
                        font-size: 13px;
                        margin-top: 6px;
                    }
                    /* Reset button styling - optional */
                    #rkfl-clear-verification-btn {
                        margin: 1em 0;
                        padding: 0.5em 1em;
                        background: #d9534f;
                        color: white;
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                ');
            }

            private function get_frontend_js() {
                return <<<JS
(function() {
    const sessionKey = 'rkfl_age_verified';

    function isAgeVerified() {
        return sessionStorage.getItem(sessionKey) === 'yes';
    }

    function setAgeVerified() {
        sessionStorage.setItem(sessionKey, 'yes');
    }

    // Inform server via AJAX that age is verified
    function notifyServerAgeVerified() {
        fetch(rkflSettings.ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: 'action=rkfl_set_age_verified'
        }).then(resp => resp.json()).then(data => {
            if (!data.success) {
                console.warn('Failed to set server age verified');
            }
        }).catch(console.error);
    }

    // AJAX to clear server session flag
    function notifyServerClearAgeVerified() {
        return fetch(rkflSettings.ajaxUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: 'action=rkfl_clear_age_verified'
        })
        .then(resp => resp.json());
    }

    // Global SDK init and launch
    (function() {
        if (!window._rkflSdkInstance) {
            if (typeof window.RkflPlugin !== "function") {
                console.error("Rocketfuel SDK (RkflPlugin) not loaded.");
                return;
            }
            const agePlugin = { feature: "AGE_VERIFICATION", containerId: "verification-container", inject: false };
            window._rkflSdkInstance = new window.RkflPlugin({
                plugins: [agePlugin],
                environment: rkflSettings.environment,
                clientId: rkflSettings.clientId,
            });
            window._rkflSdkInstance.init();
        }
    })();

    function unblurImages() {
        document.querySelectorAll('.rkfl-blur-img-wrapper').forEach(el => {
            el.style.filter = 'none';
            el.classList.remove('rkfl-blur-img-wrapper');
        });
    }

    function removeVerifyButtons() {
        document.querySelectorAll('button.rkfl-verify-age-btn').forEach(btn => btn.remove());
        document.querySelectorAll('.rkfl-age-msg').forEach(msg => { msg.style.display = 'none'; });
    }

    function enableAddToCartButtons() {
        document.querySelectorAll('.age-restricted-product').forEach(productEl => {
            const btn = productEl.querySelector('.add_to_cart_button');
            if (btn) {
                btn.disabled = false;
                btn.style.display = '';
            }
        });
        const singleCartBtn = document.querySelector('form.cart button[type="submit"]');
        if (singleCartBtn) {
            singleCartBtn.disabled = false;
            singleCartBtn.textContent = 'Add to cart';
            singleCartBtn.style.display = '';
        }
    }

    function disableAddToCartButtons() {
        document.querySelectorAll('.age-restricted-product').forEach(productEl => {
            const btn = productEl.querySelector('.add_to_cart_button');
            if (btn) {
                btn.disabled = true;
            }
        });
        const singleCartBtn = document.querySelector('form.cart button[type="submit"]');
        if (singleCartBtn) {
            singleCartBtn.disabled = true;
            singleCartBtn.textContent = 'Verify Age';
            singleCartBtn.style.display = '';
            // Example styles
        }
    }

    function showMessage(productId, message) {
        const msgEl = document.getElementById('rkfl-msg-' + productId);
        if (msgEl) {
            msgEl.textContent = message;
            msgEl.style.display = 'block';
        }
    }

    function setupVerifyButtons() {
        document.querySelectorAll('button.rkfl-verify-age-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.display = '';
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (typeof window.launchAgeVerificationWidget === 'function') {
                    window.launchAgeVerificationWidget();

                    function onMessage(ev) {
                        if (ev.data && ev.data.type === "AGE_VERIFICATION" && ev.data.verified) {
                            setAgeVerified();
                            notifyServerAgeVerified();
                            unblurImages();
                            removeVerifyButtons();
                            enableAddToCartButtons();
                            window.removeEventListener('message', onMessage);
                        }
                    }
                    window.addEventListener('message', onMessage);
                } else {
                    console.warn('launchAgeVerificationWidget() function is not defined.');
                }
            });
        });
    }

    // Button & function to clear verification session (both client and server) and reset UI
    function clearAgeVerification() {
        // Clear client-side sessionStorage
        sessionStorage.removeItem(sessionKey);

        // AJAX to clear server session flag, then reload page to reset UI
        notifyServerClearAgeVerified()
            .then(data => {
                if (data.success) {
                    // window.location.reload();
                } else {
                    console.warn('Failed to clear server age verification session.');
                }
            })
            .catch(console.error);
    }

    // Add reset button dynamically to page footer (optional; you can place this elsewhere or via shortcode)
    function addResetButton() {
        if (document.getElementById('rkfl-clear-verification-btn')) return; // Already added

        const btn = document.createElement('button');
        btn.id = 'rkfl-clear-verification-btn';
        btn.textContent = 'Reset Age Verification';
        btn.style.margin = '1em 0';
        btn.style.padding = '0.5em 1em';
        btn.style.background = '#d9534f';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '3px';
        btn.style.cursor = 'pointer';

        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset age verification?')) {
                clearAgeVerification();
            }
        });

        // Append button at end of body
        document.body.appendChild(btn);
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (isAgeVerified()) {
            unblurImages();
            removeVerifyButtons();
            enableAddToCartButtons();
        } else {
            disableAddToCartButtons();
            setupVerifyButtons();
        }

        // Always add Reset Age Verification button (optional)
        // addResetButton();

        // Block add-to-cart on age restricted products before verification on archive/shop pages
        document.body.addEventListener('click', (e) => {
            const atcBtn = e.target.closest('.add_to_cart_button');
            if (atcBtn) {
                const productEl = atcBtn.closest('.age-restricted-product');
                if (productEl && !isAgeVerified()) {
                    e.preventDefault();
                    const prodId = productEl.getAttribute('data-product_id') || '';
                    showMessage(prodId, 'Please verify your age first.');
                }
            }
        }, true);

        // Handle verify age on single product page button click
        const singleCartBtn = document.querySelector('form.cart button[type="submit"]');
        if (singleCartBtn && singleCartBtn.textContent.trim().toLowerCase().includes('verify age')) {
            singleCartBtn.disabled = false;
            singleCartBtn.style.display = '';
            singleCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof window.launchAgeVerificationWidget === 'function') {
                    window.launchAgeVerificationWidget();

                    function onMessage(ev) {
                        if (ev.data && ev.data.type === "AGE_VERIFICATION" && ev.data.verified) {
                            setAgeVerified();
                            notifyServerAgeVerified();
                            unblurImages();
                            removeVerifyButtons();
                            enableAddToCartButtons();
                            document.querySelector('form.cart').submit();
                            window.removeEventListener('message', onMessage);
                        }
                    }
                    window.addEventListener('message', onMessage);
                } else {
                    console.warn('launchAgeVerificationWidget() function is not defined.');
                }
            });
        }
    });
})();
JS;
            }
        }
    }
}

// Add age-restricted product class
add_filter('woocommerce_post_class', function ($classes, $product) {
    if (!$product) {
        return $classes;
    }
    $age_restricted = get_post_meta($product->get_id(), 'age_restricted', true);
    if ($age_restricted === 'yes') {
        $classes[] = 'age-restricted-product';
    }
    return $classes;
}, 10, 2);

// Wrap product image to only blur the image element
add_filter('woocommerce_product_get_image', function ($image, $product) {
    if (!$product) {
        return $image;
    }
    $age_restricted = get_post_meta($product->get_id(), 'age_restricted', true);
    if ($age_restricted === 'yes') {
        return '<span class="rkfl-blur-img-wrapper">' . $image . '</span>';
    }
    return $image;
}, 10, 2);

// Conditionally replace Add To Cart button with Verify Age button on archive/shop pages for unverified users
add_action('template_redirect', function () {
    if (!is_user_age_verified()) {
        add_filter('woocommerce_loop_add_to_cart_link', 'rkfl_replace_add_to_cart_button', 10, 2);
        add_filter('woocommerce_product_single_add_to_cart_text', 'rkfl_replace_single_product_add_to_cart_text', 99, 2);
    }
});

function rkfl_replace_add_to_cart_button($html, $product) {
    if (get_post_meta($product->get_id(), 'age_restricted', true) === 'yes') {
        return '<button type="button" class="button rkfl-verify-age-btn" data-product-id="' . esc_attr($product->get_id()) . '">Verify Age</button>'
            . '<div class="rkfl-age-msg" id="rkfl-msg-' . esc_attr($product->get_id()) . '" style="display:none;"></div>';
    }
    return $html;
}

function rkfl_replace_single_product_add_to_cart_text($text, $product) {
    if (get_post_meta($product->get_id(), 'age_restricted', true) === 'yes') {
        return 'Verify Age';
    }
    return $text;
}

// Add checkbox in product edit page to mark product as age restricted
add_action('woocommerce_product_options_general_product_data', function () {
    woocommerce_wp_checkbox([
        'id'          => 'age_restricted',
        'label'       => 'Age Restricted Product',
        'description' => 'Require age verification before purchase',
    ]);
});

// Save the age restricted checkbox value
add_action('woocommerce_process_product_meta', function ($post_id) {
    $is_restricted = isset($_POST['age_restricted']) ? 'yes' : 'no';
    update_post_meta($post_id, 'age_restricted', $is_restricted);
});

// Add "Settings" link in Plugins list page for convenience
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
    $settings_link = '<a href="' . admin_url('admin.php?page=wc-settings&tab=checkout&section=rocketfuel_gateway') . '">Settings</a>';
    array_unshift($links, $settings_link);
    return $links;
});
