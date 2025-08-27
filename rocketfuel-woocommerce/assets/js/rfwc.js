(function ($) {
  'use strict';

  $(document).ready(function () {
    if (typeof rkflSettings === 'undefined') {
      console.error('Rocketfuel settings not loaded');
      return;
    }
    var agePlugin = new window.RkflPlugin({
      plugins: [{ feature: "AGE_VERIFICATION", inject: false }],
      environment: rkflSettings.environment || 'qa',
      clientId: rkflSettings.clientId || '',
    });
    agePlugin.init();
    window.addEventListener('message', function (event) {
      console.log(event);
      const data = event.data;

      if (data.type === 'AGE_VERIFICATION') {
        if (data.verified === true) {

          fetch(rkflSettings.restUrl + '/set-age-verified', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': rkflSettings.nonce
            },
            body: JSON.stringify({
              action: 'rfwc_set_age_verified',
              verified: 1,
              nonce: rkflSettings.nonce           // optional if you check nonce in args in PHP
            }),
            credentials: 'include',
          })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                this.window.location.reload();
                console.log('Age verified:', data.data.message);
              } else {
                console.error('Verification failed:', data);
              }
            })
            .catch(error => console.error('Error:', error));
        } else {
          alert('Age Verification Failed ❌');
        }
      }


      if (data.type === 'rocketfuel_result_ok' && data.paymentCompleted === 1) {

      }
    });
    function initializeSdk() {
      const data = document.querySelector('.wc-block-checkout, form.checkout') !== null;
      console.log("🚀 ~ initializeSdk ~ data:", data)
      if (!data) {
        return;
      }
      console.log('sdk payin initialized')
      window.payinSdk = new window.RkflPlugin({
        plugins: [{ feature: 'PAYIN', containerId: 'rocketfuel-button' }],
        environment: rkflSettings.environment || 'qa',
        clientId: rkflSettings.clientId || '',
        redirect: rkflSettings.redirect || false,
      });
      window.payinSdk.init();
    }
    // Initialize payment function modified to use the hidden container
    window.initializePayment = function () {
      fetch(rkflSettings.restUrl + '/cart-payload', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json',  'X-WP-Nonce': rkflSettings.nonce },
      });

      fetch(rkflSettings.restUrl + '/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json',  'X-WP-Nonce': rkflSettings.nonce },
      })
        .then(r => r.json())
        .then(data => {
          if (data.uuid) {

            window.payinSdk.prepareOrder(data.uuid);
          }
        })
        .catch(console.error);
    };

    window.prepareRocketfuelOrder = window.initializePayment;
    window.initializeSdk = initializeSdk();
    window.agePlugin = agePlugin;
    window.handleAgeVerification = function () {
      agePlugin.launchAgeVerificationWidget();
    }
  });
})(jQuery);
