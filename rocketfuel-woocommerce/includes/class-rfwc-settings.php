<?php
if (!defined('ABSPATH')) {
    exit;
}

class RFWC_Settings {
    const OPT_GROUP = 'rfwc_options';

    public static function init() {
        add_action('admin_menu', [__CLASS__, 'menu']);
        add_action('admin_init', [__CLASS__, 'register']);
    }

    public static function get($key) {
        $opts = get_option(self::OPT_GROUP, []);
        return $opts[$key] ?? '';
    }

    public static function menu() {
        add_menu_page(
            'Rocketfuel Settings',
            'Rocketfuel SDK',
            'manage_options',
            'rfwc-settings',
            [__CLASS__, 'page'],
            'dashicons-shield-alt'
        );
    }

    public static function register() {
        register_setting(self::OPT_GROUP, self::OPT_GROUP, [
            'sanitize_callback' => [__CLASS__, 'sanitize']
        ]);

        add_settings_section('rfwc_main', 'SDK Configuration', '__return_null', 'rfwc-settings');

        $fields = [
            'client_id' => ['label' => 'Client ID', 'type' => 'text'],
            'server_url' => ['label' => 'Your backend URL', 'type' => 'text'],
            'merchant_id' => ['label' => 'Merchant ID', 'type' => 'text'],
            'environment' => ['label' => 'Environment', 'type' => 'select', 'options' => ['production','sandbox','qa','preprod']],
            'redirect' => ['label' => 'Enable Redirect Flow', 'type' => 'checkbox']
        ];

        foreach ($fields as $id => $f) {
            add_settings_field($id, $f['label'], function () use ($id, $f) {
                $val = RFWC_Settings::get($id);
                if ($f['type'] === 'checkbox') {
                    printf('<input type="checkbox" name="%s[%s]" value="1" %s>', RFWC_Settings::OPT_GROUP, $id, checked($val, 1, false));
                } elseif ($f['type'] === 'select') {
                    echo "<select name=\"" . RFWC_Settings::OPT_GROUP . "[$id]\">";
                    foreach ($f['options'] as $opt) {
                        printf('<option value="%s" %s>%s</option>', $opt, selected($val, $opt, false), ucfirst($opt));
                    }
                    echo '</select>';
                } else {
                    printf('<input type="text" name="%s[%s]" value="%s" class="regular-text">', RFWC_Settings::OPT_GROUP, $id, esc_attr($val));
                }
            }, 'rfwc-settings', 'rfwc_main');
        }
    }

    public static function sanitize($input) {
        $output = [];
        $output['client_id'] = sanitize_text_field($input['client_id'] ?? '');
        $output['merchant_id'] = sanitize_text_field($input['merchant_id'] ?? '');
        $output['environment'] = in_array($input['environment'] ?? '', ['production','sandbox','qa','preprod'], true) ? $input['environment'] : 'qa';
        $output['redirect'] = !empty($input['redirect']) ? 1 : 0;
        $output['server_url'] = sanitize_text_field($input['server_url'] ?? '');
        return $output;
    }

    public static function page() {
        ?>
        <div class="wrap">
            <h1>Rocketfuel SDK Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields(self::OPT_GROUP);
                do_settings_sections('rfwc-settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
}
