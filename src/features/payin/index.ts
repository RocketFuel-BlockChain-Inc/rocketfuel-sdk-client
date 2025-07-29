import RocketFuel from './plugin';

let rkflInstance: RocketFuel;
declare global {
  interface Window {
    token: string;
    merchantAuth: string;
    rkfl: any;
    paymentdone: boolean;
  }
}
function makeOrderData() {

  return {
    "amount": "3",
    "currency": "USD",
    "cart": [
      {
        "id": "1099_129",
        "name": "Dummy Product",
        "price": "3",
        "quantity": 1
      }
    ],
    "customerInfo": {
      "name": "rkflcs",
      "email": "hari.s@rocketfuel.inc"
    },
    "customParameter": {
      "returnMethod": "GET",
      "params": [
        {
          "name": "submerchant",
          "value": "bigcommerce"
        }
      ]
    },
    "merchant_id": "{{merchantId}}",
    "redirectUrl": "https://www.irctc.co.in/nget/train-search"
  }
}

export async function placeOrder(clientId: string, clientSecret: string, merchantId: string, redirect: Boolean = false) {
  const data = makeOrderData();
  console.log('cart data', data);
  try {
    // Create instance for reuse if needed later
    rkflInstance = new RocketFuel({
      environment: 'stage2',
      clientId,
      clientSecret,
      merchantId
    });
    const response = await rkflInstance.purchaseCheck(data);
    if(redirect) {
      rkflInstance.openRedirect(response?.url)
    } else {
      rkflInstance.openIframe(response?.url)
    }

  } catch (err) {
    console.error("Failed to place order", err);
  }
  
}
