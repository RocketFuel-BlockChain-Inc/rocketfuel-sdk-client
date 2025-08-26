(function() {
    // Your code here using local variables
    const registerPaymentMethod = window.wc?.wcBlocksRegistry?.registerPaymentMethod;
    const createElement = window.wp?.element?.createElement;
    const decodeEntities = window.wp?.htmlEntities?.decodeEntities;
    const __ = window.wp?.i18n?.__;

    if (!registerPaymentMethod || !createElement) {
        console.error('WooCommerce Blocks registry or wp.element not available');
        return;
    }

    const settings = window.wc.wcSettings.getSetting('rocketfuel_gateway_data', {});

    const Content = () =>
        createElement(
            'div',
            null,
            decodeEntities(settings.description || __('Pay with Rocketfuel.', 'rocketfuel-gateway'))
        );

    const PaymentMethodBlock = {
        name: 'rocketfuel_gateway',
        label: decodeEntities(settings.title || __('Rocketfuel Payment', 'rocketfuel-gateway')),
        content: createElement(Content, null),
        edit: createElement(Content, null),
        canMakePayment: () => true,
        ariaLabel: decodeEntities(settings.title || __('Rocketfuel Payment', 'rocketfuel-gateway')),
        supports: {
            features: ['products'],
        },
    };

    registerPaymentMethod(PaymentMethodBlock);
})();
