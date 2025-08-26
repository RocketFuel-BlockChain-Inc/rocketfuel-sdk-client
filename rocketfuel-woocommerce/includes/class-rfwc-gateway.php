<?php
if (!defined('ABSPATH')) {
    exit;
}

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

add_action('plugins_loaded', function () {
    if (!class_exists('WC_Payment_Gateway')) {
        return;
    }

    // Classic Rocketfuel Gateway
    class WC_Rocketfuel_Gateway extends WC_Payment_Gateway
    {
        public function __construct()
        {
            $this->id = 'rocketfuel_gateway';
            $this->has_fields = false;
            $this->method_title = 'Rocketfuel Payment';
            $this->method_description = 'Pay with Rocketfuel';

            $this->init_form_fields();
            $this->init_settings();
            $this->enabled = $this->get_option('enabled', 'no');

            add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
        }

        public function init_form_fields()
        {
            // Kept original form fields exactly
            $this->form_fields = [
                'enabled' => [
                    'title' => 'Enable/Disable',
                    'type' => 'checkbox',
                    'label' => 'Enable Rocketfuel Gateway',
                    'default' => 'no',
                ],
                'settings_notice' => [
                    'title' => 'Configuration',
                    'type' => 'title',
                    'description' => 'To configure Client ID, Server URL, Merchant ID, and other settings, go to <a href="' . admin_url('admin.php?page=rfwc-settings') . '">Rocketfuel SDK Settings</a>.',
                ],
            ];
        }

        public function is_available()
        {
            $this->init_settings();
            $client_id = RFWC_Settings::get('client_id');
            return $this->enabled === 'yes' && !empty($client_id);
        }

        public function process_payment($order_id)
        {
            return [
                'result' => 'pending',
                'redirect' => '', // No redirect, will be handled after AJAX order creation
            ];

        }
    }

    // Register classic gateway
    add_filter('woocommerce_payment_gateways', function ($methods) {
        $methods[] = 'WC_Rocketfuel_Gateway';
        return $methods;
    });

    // Blocks Checkout Integration
    if (class_exists(AbstractPaymentMethodType::class)) {
        class Rocketfuel_Blocks_Payment extends AbstractPaymentMethodType
        {
            protected $name = 'rocketfuel_gateway';

            private $gateway;

            public function initialize()
            {
                $this->gateway = new WC_Rocketfuel_Gateway();
            }

            public function is_active()
            {
                return $this->gateway->is_available();
            }

            public function get_payment_method_script_handles()
            {
    
                return ['wc-rocketfuel-blocks-integration', 'wc-rocketfuel-place-order'];
            }

            public function get_payment_method_data()
            {
                return [
                    'title' => $this->gateway->method_title,
                    'description' => $this->gateway->method_description,
                ];
            }
        }

        add_action('woocommerce_blocks_loaded', function () {
            add_action('woocommerce_blocks_payment_method_type_registration', function ($payment_method_registry) {
                $payment_method_registry->register(new Rocketfuel_Blocks_Payment());
            });
        });


    }

});