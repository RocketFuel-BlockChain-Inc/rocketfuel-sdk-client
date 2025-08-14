<?php
/**
 * Plugin Name: Rocketfuel SDK Payment Gateway
 * Description: WooCommerce payment gateway with Rocketfuel SDK age verification. Blocks add-to-cart and blurs product images until age verified. Server-session sync.
 * Version: 2.2
 * Author: Rocketfuel Inc.
 */

if (!defined('ABSPATH')) {
    exit;
}

// Start PHP session early (if not started)
add_action('init', function () {
    if (!session_id()) {
        session_start();
    }
});

// Server-side check if user age verified
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

// Register Rocketfuel payment gateway class
add_filter('woocommerce_payment_gateways', function ($gateways) {
    $gateways[] = 'WC_Rocketfuel_Gateway';
    return $gateways;
});

add_action('plugins_loaded', 'rkfl_init_gateway_class');
function rkfl_init_gateway_class() {
    if (!class_exists('WC_Payment_Gateway')) {
        return;
    }

    class WC_Rocketfuel_Gateway extends WC_Payment_Gateway {
        public function __construct() {
            $this->id = 'rocketfuel_gateway';
            $this->has_fields = false;
            $this->method_title = 'Rocketfuel Payment';
            $this->method_description = 'Pay with Rocketfuel and use SDK age verification.';

            $this->init_form_fields();
            $this->init_settings();

            $this->enabled = $this->get_option('enabled');
            $this->title = $this->get_option('title');
            $this->client_id = $this->get_option('client_id');
            $this->environment = $this->get_option('environment');

            add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
            add_action('wp_enqueue_scripts', [$this, 'enqueue_sdk_scripts']);
        }

        public function init_form_fields() {
            $this->form_fields = [
                'enabled' => [
                    'title' => 'Enable/Disable',
                    'type' => 'checkbox',
                    'label' => 'Enable Rocketfuel Gateway',
                    'default' => 'yes',
                ],
                'title' => [
                    'title' => 'Title',
                    'type' => 'text',
                    'description' => 'Title shown during checkout.',
                    'default' => 'Rocketfuel',
                    'desc_tip' => true,
                ],
                'client_id' => [
                    'title' => 'Client ID',
                    'type' => 'text',
                    'description' => 'Your Rocketfuel client ID.',
                    'desc_tip' => true,
                    'default' => '',
                ],
                'environment' => [
                    'title' => 'Environment',
                    'type' => 'select',
                    'description' => 'Select environment.',
                    'default' => 'sandbox',
                    'options' => [
                        'sandbox' => 'Sandbox',
                        'production' => 'Production',
                    ],
                ],
            ];
        }

        public function enqueue_sdk_scripts() {
            // Load SDK only on product-related pages and checkout
            if (!is_product() && !is_shop() && !is_product_category() && !is_product_tag() && !is_checkout()) {
                return;
            }

            // SDK core JS
            wp_enqueue_script(
                'rkfl-sdk',
                plugin_dir_url(__FILE__) . 'dist/rkfl-transact-client.min-0.0.1.js',
                [],
                '1.0.0',
                true
            );

            // Register empty placeholder script to localize settings
            wp_register_script('rkfl-frontend', '', [], null, true);

            // Pass settings and AJAX URL to JS
            wp_localize_script('rkfl-frontend', 'rkflSettings', [
                'clientId' => $this->client_id,
                'environment' => $this->environment,
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'sdkOrigin' => 'https://your-sdk-domain.com', // Set to your actual SDK iframe/message origin
            ]);

            wp_enqueue_script('rkfl-frontend');

            // Inline JS for SDK init, event listener, UI updates
            wp_add_inline_script('rkfl-frontend', $this->get_frontend_js());

            // Add CSS for blur and buttons (minimal improved styling)
            wp_add_inline_style('woocommerce-inline', '
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
                    background-color: #007cba;
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    margin-top: 8px;
                    display: inline-block;
                }
                button.rkfl-verify-age-btn:disabled {
                    background-color: gray;
                    cursor: not-allowed;
                    opacity: 0.6;
                }
                button.rkfl-verify-age-btn:not(:disabled):hover {
                    background-color: #005f8d;
                }
                .rkfl-age-msg {
                    color: red;
                    font-size: 13px;
                    margin-top: 6px;
                }
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

    // Server session sync helpers
    function notifyServerAgeVerified() {
        fetch(rkflSettings.ajaxUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            body: 'action=rkfl_set_age_verified'
        }).then(resp => resp.json()).then(data => {
            if (!data.success) {
                console.warn('Failed to set server age verified');
            }
        }).catch(console.error);
    }
    function notifyServerClearAgeVerified() {
        return fetch(rkflSettings.ajaxUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            body: 'action=rkfl_clear_age_verified'
        }).then(resp => resp.json());
    }

    // Check if user is age verified in sessionStorage
    function isAgeVerified() {
        return sessionStorage.getItem(sessionKey) === 'yes';
    }
    function setAgeVerified() {
        sessionStorage.setItem(sessionKey, 'yes');
    }
    function clearAgeVerified() {
        sessionStorage.removeItem(sessionKey);
    }

    // Unblur product images marked for blur
    function unblurImages() {
        document.querySelectorAll('.rkfl-blur-img-wrapper').forEach(el => {
            el.style.filter = 'none';
            el.classList.remove('rkfl-blur-img-wrapper');
        });
    }

    // Remove verify age buttons/messages
    function removeVerifyButtons() {
        document.querySelectorAll('button.rkfl-verify-age-btn').forEach(btn => btn.remove());
        document.querySelectorAll('.rkfl-age-msg').forEach(msg => { msg.style.display = 'none'; });
    }

    // Enable add-to-cart buttons for age-restricted products
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

    // Disable add-to-cart buttons on age-restricted products
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
        }
    }

    // Show message below product verify button
    function showMessage(productId, message) {
        const msgEl = document.getElementById('rkfl-msg-' + productId);
        if (msgEl) {
            msgEl.textContent = message;
            msgEl.style.display = 'block';
        }
    }

    // Initialize SDK instance with age verification plugin (inject: false)
    function initSdk() {
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
    }

    // Launch age verification widget manually
    function launchAgeVerification() {
        if (window._rkflSdkInstance && typeof window._rkflSdkInstance.launchAgeVerificationWidget === 'function') {
            window._rkflSdkInstance.launchAgeVerificationWidget();
        } else {
            console.warn('Rocketfuel SDK instance or launch function not ready.');
        }
    }

    // Handle age verification result message
    function onAgeVerificationMessage(ev) {
        // Verify origin to prevent spoofing
        if (ev.origin !== rkflSettings.sdkOrigin) {
            return;
        }
        if (ev.data && ev.data.type === "AGE_VERIFICATION") {
            if (ev.data.verified === true) {
                setAgeVerified();
                notifyServerAgeVerified();
                unblurImages();
                removeVerifyButtons();
                enableAddToCartButtons();
                if (window._rkflOnVerificationCallback) {
                    window._rkflOnVerificationCallback();
                    window._rkflOnVerificationCallback = null;
                }
            } else {
                console.log('User failed age verification');
            }
            // Remove event listener after use to avoid multiple handlers
            window.removeEventListener('message', onAgeVerificationMessage);
        }
    }

    // Setup verify age buttons on products
    function setupVerifyButtons() {
        document.querySelectorAll('button.rkfl-verify-age-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.display = '';
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                initSdk();
                window._rkflOnVerificationCallback = () => {
                    // Optionally submit form or other actions on verification
                    const productForm = btn.closest('.product').querySelector('form.cart');
                    if (productForm) {
                        productForm.submit();
                    }
                };
                window.addEventListener('message', onAgeVerificationMessage);
                launchAgeVerification();
            });
        });
    }

    // Clear verification session (client and server)
    function clearAgeVerification() {
        clearAgeVerified();
        notifyServerClearAgeVerified().then(data => {
            if (data.success) {
                // Reload to reflect UI changes
                window.location.reload();
            } else {
                console.warn('Failed to clear server age verification session.');
            }
        }).catch(console.error);
    }

    // Optionally add Reset button to page footer
    function addResetButton() {
        if (document.getElementById('rkfl-clear-verification-btn')) return;

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

        document.body.appendChild(btn);
    }

    document.addEventListener('DOMContentLoaded', () => {
        initSdk();

        if (isAgeVerified()) {
            unblurImages();
            removeVerifyButtons();
            enableAddToCartButtons();
        } else {
            disableAddToCartButtons();
            setupVerifyButtons();
        }

        // Always add reset button if you want (commented out by default)
        // addResetButton();


        // Block add-to-cart on age-restricted products shop/archive pages
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
    });
})();
JS;
        }
    }
}

// Add age-restricted product class for styling and functionality
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

// Wrap product image in blur wrapper for age restricted products
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

// Replace Add To Cart button with Verify Age button on shop/archive pages if not verified
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
        return 'Verify Age'; // Text on single product page button before verification
    }
    return $text;
}

// Add checkbox on product edit page to mark product as age restricted
add_action('woocommerce_product_options_general_product_data', function () {
    woocommerce_wp_checkbox([
        'id' => 'age_restricted',
        'label' => 'Age Restricted Product',
        'description' => 'Require age verification before purchase',
    ]);
});

// Save the age restricted checkbox value on product save
add_action('woocommerce_process_product_meta', function ($post_id) {
    $is_restricted = isset($_POST['age_restricted']) ? 'yes' : 'no';
    update_post_meta($post_id, 'age_restricted', $is_restricted);
});

// Add Settings link in plugin list for convenience
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
    $settings_link = '<a href="' . admin_url('admin.php?page=wc-settings&tab=checkout&section=rocketfuel_gateway') . '">Settings</a>';
    array_unshift($links, $settings_link);
    return $links;
});
