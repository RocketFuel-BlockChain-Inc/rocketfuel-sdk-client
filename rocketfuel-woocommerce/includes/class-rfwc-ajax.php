<?php
if (!defined('ABSPATH')) {
    exit;
}

class RFWC_Ajax
{
    public static function init()
    {
        add_action('wp_ajax_rfwc_set_age_verified', [__CLASS__, 'set_age_verified']);
        add_action('wp_ajax_nopriv_rfwc_set_age_verified', [__CLASS__, 'set_age_verified']);
        add_action('rest_api_init', [__CLASS__, 'register_rest_routes']);

    }

    public static function register_rest_routes()
    {
        register_rest_route('rkfl/v1', '/cart-payload', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_cart_payload'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('rkfl/v1', '/create-order', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'create_order'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('rkfl/v1', '/set-age-verified', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'set_age_verified'],
            'permission_callback' => '__return_true', // change if permission needed
        ]);
    }

    // Bootstrap WooCommerce session/customer/cart for REST API context
    protected static function bootstrap_wc()
    {
        if (!function_exists('WC')) {
            return false;
        }
        if (is_null(WC()->session)) {
            WC()->session = new WC_Session_Handler();
            WC()->session->init();
        }
        if (is_null(WC()->customer)) {
            WC()->customer = new WC_Customer(get_current_user_id(), true);
        }
        if (is_null(WC()->cart)) {
            WC()->cart = new WC_Cart();
        }
        // Load cart contents
        WC()->cart->get_cart();
        return true;
    }

    public static function get_cart_payload()
    {
        self::bootstrap_wc();

        if (!function_exists('WC')) {
            return new WP_Error('no_wc', 'WooCommerce not available', ['status' => 400]);
        }
        if (!WC()->cart) {
            return new WP_Error('no_cart', 'Cart object not available', ['status' => 400]);
        }
        if (WC()->cart->is_empty()) {
            return new WP_Error('empty_cart', WC()->session, ['status' => 400]);
        }

        $items = [];
        foreach (WC()->cart->get_cart() as $cart_item) {
            $product = $cart_item['data'];
            $items[] = [
                'id' => (string) $cart_item['product_id'],
                'name' => html_entity_decode($product->get_name()),
                'price' => (string) wc_format_decimal($product->get_price(), 2),
                'quantity' => (int) $cart_item['quantity'],
            ];
        }

        $cartObj = [
            'amount' => wc_format_decimal(WC()->cart->get_total('edit'), 2),
            'currency' => get_woocommerce_currency(),
            'cart' => $items,
            'customerInfo' => [
                'name' => trim(string: WC()->customer->get_billing_first_name() . ' ' . WC()->customer->get_billing_last_name()),
                'email' => WC()->customer->get_billing_email(),
                'phone' => WC()->customer->get_billing_phone(),
                'address' => WC()->customer->get_billing_address() . WC()->customer->get_billing_address_1() . ',' .
                    WC()->customer->get_billing_address_2() . ',' . WC()->customer->get_billing_city() . ',' .
                    WC()->customer->get_billing_state() . ',' . WC()->customer->get_billing_country() . ' - ' . WC()->customer->get_billing_postcode(),
            ],
            'shippingAddress' => [
                'firstname' => WC()->customer->get_shipping_first_name(),
                'lastname' => WC()->customer->get_shipping_last_name(),
                'phoneNo' => WC()->customer->get_shipping_phone(),
                'address1' => WC()->customer->get_shipping_address_1(),
                'address2' => WC()->customer->get_shipping_address_2(),
                'state' => WC()->customer->get_shipping_state(),
                'city' => WC()->customer->get_shipping_city(),
                'zipcode' => WC()->customer->get_shipping_postcode(),
                'country' => WC()->customer->get_shipping_country(),
                'landmark' => WC()->customer->get_shipping_address(),
                'email' => WC()->customer->get_billing_email(),
            ],

        ];
        return $cartObj;

    }

    public static function create_order($request)
    {
        self::bootstrap_wc();

        if (!function_exists('WC') || !WC()->cart) {
            return new WP_Error('no_wc', 'WooCommerce not available', ['status' => 400]);
        }
        if (WC()->cart->is_empty()) {
            return new WP_Error('empty_cart', 'Your cart is empty', ['status' => 400]);
        }

        $input = $request->get_json_params();
        $opts = get_option('rfwc_options', []);
        $cart_items = [];

        foreach (WC()->cart->get_cart() as $item) {
            $product = $item['data'];
            $cart_items[] = [
                'id' => (string) $item['product_id'],
                'name' => html_entity_decode($product->get_name()),
                'price' => (string) wc_format_decimal($product->get_price(), 2),
                'quantity' => intval($item['quantity']),
            ];
        }

        $payload = [
            'amount' => (string) wc_format_decimal(WC()->cart->get_total('edit'), 2),
            'currency' => get_woocommerce_currency(),
            'cart' => $cart_items,
            'customerInfo' => [
                'name' => !empty($input['customerInfo']['name'])
                    ? sanitize_text_field($input['customerInfo']['name'])
                    : trim(WC()->customer->get_billing_first_name() . ' ' . WC()->customer->get_billing_last_name()),
                'email' => !empty($input['customerInfo']['email'])
                    ? sanitize_email($input['customerInfo']['email'])
                    : WC()->customer->get_billing_email(),
            ],
            'customParameter' => [
                'returnMethod' => 'GET',
                'params' => [
                    ['name' => 'submerchant', 'value' => get_bloginfo('name')],
                ],
            ],
            'merchant_id' => $opts['merchant_id'] ?? '',
        ];

        $response = wp_remote_post($opts['server_url'], [
            'headers' => ['Content-Type' => 'application/json'],
            'body' => wp_json_encode($payload),
            'timeout' => 30,
        ]);


        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (empty($body['uuid'])) {
            return new WP_Error('invalid_response', 'Order not created', [
                'status' => 500,
                'payload' => $payload,
                'body' => $response
            ]);
        }

        return ['uuid' => $body['uuid']];
    }

    public static function set_age_verified()
    {
        if (is_user_logged_in()) {
            update_user_meta(get_current_user_id(), 'rfwc_age_verified', '1');
        } else {
            if (!session_id()) {
                session_start();
            }
            $_SESSION['rfwc_age_verified'] = true;
            setcookie('rfwc_age_verified', '1', time() + DAY_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN);
        }
        return rest_ensure_response(['success' => true, 'message' => 'Age verified']);
    }



}
