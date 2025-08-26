(function ($) {
  'use strict';

  $(document).ready(function () {
    if (typeof rkflSettings === 'undefined') {
      console.error('Rocketfuel settings not loaded');
      return;
    }

    window.addEventListener('message', function (event) {
      console.log(event);
      const data = event.data;

      if (data.type === 'AGE_VERIFICATION') {
        if (data.verified === true) {
          alert('Age verified successfully ✅');
          $('.rkfl-age-restricted').addClass('verified');
          $('.rkfl-age-verify').text('Age Verified').prop('disabled', true);
          $('.add_to_cart_button, .single_add_to_cart_button').show();

          const pid = $('.rkfl-age-verify').data('product-id');
          if (pid) {
            $.post(rkflSettings.ajaxUrl, {
              action: 'rfwc_set_age_verified',
              product_id: pid,
              verified: 1,
              nonce: rkflSettings.nonce,
            });
          }
        } else {
          alert('Age Verification Failed ❌');
        }
      }

      if (data.type === 'rocketfuel_result_ok' && data.paymentCompleted === 1) {

      }
    });
    function initializeSdk () {
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
        headers: { 'Content-Type': 'application/json' },
      });

      fetch(rkflSettings.restUrl + '/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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

  });
})(jQuery);
