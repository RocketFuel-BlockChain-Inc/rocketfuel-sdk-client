'use strict';

var index = require('./index-a58cd5af.cjs.js');
require('crypto-js');

// RocketFuel SDK - TypeScript Version
class RocketFuel {
    constructor(options) {
        this.rkflToken = null;
        this.success_event = 'rocketfuel_result_ok';
        this.clientId = options.clientId;
        this.domain = index.getBaseUrl(options.environment);
        this.initialize();
    }
    handleMessage(event) {
        const eventData = event.data;
        if (eventData.type === this.success_event) {
            if (eventData.paymentCompleted === 1) {
                const t = setTimeout(() => {
                    index.IframeUtiltites.closeIframe();
                    clearTimeout(t);
                }, 30000);
            }
        }
    }
    initialize() {
        window.addEventListener('message', this.handleMessage);
    }
    openRedirect(uuid) {
        return index.__awaiter(this, void 0, void 0, function* () {
            const open = `${this.domain}/${uuid}`;
            window.open(open, '_blank');
        });
    }
    openIframe(uuid) {
        return index.__awaiter(this, void 0, void 0, function* () {
            const open = `${this.domain}/${uuid}`;
            index.IframeUtiltites.showOverlay(open, index.FEATURE_PAYIN.feature);
        });
    }
}

let rkflInstance;
function verifyOrderData(data) {
    // Basic format check
    if (typeof data !== 'object' ||
        !data ||
        typeof data.amount !== 'string' ||
        typeof data.currency !== 'string' ||
        !Array.isArray(data.cart) ||
        typeof data.customerInfo !== 'object' ||
        typeof data.customerInfo.name !== 'string' ||
        typeof data.customerInfo.email !== 'string' ||
        typeof data.merchant_id !== 'string') {
        throw new Error('Invalid order data format');
    }
    // Optionally, validate each cart item
    for (const item of data.cart) {
        if (typeof item.id !== 'string' ||
            typeof item.name !== 'string' ||
            typeof item.price !== 'string' ||
            typeof item.quantity !== 'number') {
            throw new Error('Invalid cart item format');
        }
    }
    // Optional: validate customParameter
    if (data.customParameter) {
        if (typeof data.customParameter.returnMethod !== 'string' ||
            !Array.isArray(data.customParameter.params)) {
            throw new Error('Invalid customParameter format');
        }
        for (const param of data.customParameter.params) {
            if (typeof param.name !== 'string' || typeof param.value !== 'string') {
                throw new Error('Invalid param format inside customParameter');
            }
        }
    }
    // Return the validated object
    return {
        amount: data.amount,
        currency: data.currency,
        cart: data.cart,
        customerInfo: data.customerInfo,
        customParameter: data.customParameter,
        merchant_id: data.merchant_id,
        redirectUrl: data.redirectUrl,
    };
}
function placeOrder(clientId_1) {
    return index.__awaiter(this, arguments, void 0, function* (clientId, redirect = false, uuid, environment) {
        try {
            // Create instance for reuse if needed later
            rkflInstance = new RocketFuel({ clientId, environment });
            if (redirect) {
                rkflInstance.openRedirect(uuid);
            }
            else {
                rkflInstance.openIframe(uuid);
            }
        }
        catch (err) {
            console.error('Failed to place order', err);
        }
    });
}

exports.placeOrder = placeOrder;
exports.verifyOrderData = verifyOrderData;
