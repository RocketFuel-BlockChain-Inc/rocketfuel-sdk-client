(function ($) {
  const { registerCheckoutFilters } = window.wc.blocksCheckout;
  const { select, subscribe } = window.wp.data;

  const modifyPlaceOrderButtonLabel = (defaultValue) => {
    // You can customize button text dynamically here if needed
    return defaultValue;
  };

  registerCheckoutFilters('custom-checkout-text', {
    placeOrderButtonLabel: modifyPlaceOrderButtonLabel,
  });

  async function checkIfBillingAddressEntered() {
    try {
      const response = await fetch(rkflSettings.restUrl + '/cart-payload', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      // The 'billing_address' property holds the relevant data.
      const billingAddress = data.billing_address;

      // Check if the address object exists and if a key field is not empty.
      if (billingAddress && billingAddress.address_1) {
        console.log('User has entered a billing address.');
        // Proceed with logic for when billing address is entered
        return true;
      } else {
        console.log('User has NOT entered a billing address.');
        // Proceed with logic for when billing address is missing
        return false;
      }
    } catch (error) {
      console.error('Error fetching checkout data:', error);
      return false;
    }
  }
  const handleCheckout = () => {
    const response_data = checkIfBillingAddressEntered()
    console.log("🚀 ~ handleCheckout ~ customer:", response_data)
    if (typeof window.prepareRocketfuelOrder === 'function') {
      window.prepareRocketfuelOrder('rocketfuel-button');
    } else {
      console.warn('prepareRocketfuelOrder function not found on window');
    }
  }
  subscribe(() => {
    const currentMethod = select('wc/store/payment').getActivePaymentMethod();

    if (currentMethod === 'rocketfuel_gateway') {
      const $buttonElement = $('.wc-block-components-checkout-place-order-button');

      if ($buttonElement.length && $buttonElement.children().length > 0) {
        $buttonElement.addClass('display-none');
        const $cartTotal = $('.wp-block-woocommerce-checkout-order-summary-block');
        if ($cartTotal.find('#rocketfuel-button').length === 0) {
          const $newDiv = $('<div>', { id: 'rocketfuel-button', style: 'display:flex; flex-direction: row; justify-content:center;' });
          $cartTotal.append($newDiv);
          console.debug('Added #rocketfuel-button div inside place order button');

        } else {
          console.debug('#rocketfuel-button already exists');
        }
        window?.initializeSdk?.();
        handleCheckout()
      } else {
        console.debug('Place order button element or its child not found');
      }
    } else {
      const $buttonElement = $('.wc-block-components-checkout-place-order-button');
      const $cartTotal = $('.wp-block-woocommerce-checkout-order-summary-block');

      // Revert: show back the place-order button
      $buttonElement.removeClass('display-none');

      // Revert: remove Rocketfuel button if exists
      if ($cartTotal.find('#rocketfuel-button').length > 0) {
        $cartTotal.find('#rocketfuel-button').remove();
      } else {
        console.log('No #rocketfuel-button found to remove');
      }
    }
  });
})(jQuery);
