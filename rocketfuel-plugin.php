<?php
/**
 * Plugin Name: Rocketfuel SDK Plugin
 * Description: Adds Rocketfuel buttons via shortcode.
 * Version: 1.0.0
 * Author: Rocketfuel Inc
 */

defined('ABSPATH') || exit;

function rocketfuel_enqueue_sdk_script() {
    wp_enqueue_script(
        'rocketfuel-sdk',
        plugin_dir_url(__FILE__) . 'dist/rkfl-transact-client.min-0.0.1.js',
        array(),
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'rocketfuel_enqueue_sdk_script');

function rocketfuel_sdk_shortcode($atts) {
    $a = shortcode_atts(array(
        'client_id' => '',
        'environment' => 'prod',
        'redirect' => 'false'
    ), $atts);

    return "<div id='rocketfuel-container'></div>
<script>
  window.RKFL_CONFIG = {
    clientId: '{$a['client_id']}',
    environment: '{$a['environment']}',
    redirect: " . ($a['redirect'] === 'true' ? 'true' : 'false') . ",
    plugins: [
      { feature: 'PAYIN', containerId: 'rocketfuel-container' },
      { feature: 'AGE_VERIFICATION', containerId: 'rocketfuel-container' }
    ]
  };
</script>";
}
add_shortcode('rocketfuel_sdk', 'rocketfuel_sdk_shortcode');
