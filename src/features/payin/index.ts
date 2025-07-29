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
function makeOrderData(data: any) {
  // Basic format check
  if (
    typeof data !== 'object' || !data ||
    typeof data.amount !== 'string' ||
    typeof data.currency !== 'string' ||
    !Array.isArray(data.cart) ||
    typeof data.customerInfo !== 'object' ||
    typeof data.customerInfo.name !== 'string' ||
    typeof data.customerInfo.email !== 'string' ||
    typeof data.merchant_id !== 'string' ||
    typeof data.redirectUrl !== 'string'
  ) {
    console.error("Invalid order data format");
    return null;
  }

  // Optionally, validate each cart item
  for (const item of data.cart) {
    if (
      typeof item.id !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.price !== 'string' ||
      typeof item.quantity !== 'number'
    ) {
      console.error("Invalid cart item format");
      return null;
    }
  }

  // Optional: validate customParameter
  if (data.customParameter) {
    if (
      typeof data.customParameter.returnMethod !== 'string' ||
      !Array.isArray(data.customParameter.params)
    ) {
      console.error("Invalid customParameter format");
      return null;
    }
    for (const param of data.customParameter.params) {
      if (
        typeof param.name !== 'string' ||
        typeof param.value !== 'string'
      ) {
        console.error("Invalid param format inside customParameter");
        return null;
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
    redirectUrl: data.redirectUrl
  };
}


export async function placeOrder(clientId: string, clientSecret: string, merchantId: string, redirect: Boolean = false, payload: any, environment: any) {
  console.log('clientId, clientSecret, merchantId, redirect, payload');
  const data = makeOrderData(payload);
  console.log('cart data', data, redirect);
  try {
    // Create instance for reuse if needed later
    rkflInstance = new RocketFuel({
      environment,
      clientId,
      clientSecret,
      merchantId
    });
    const response = await rkflInstance.purchaseCheck(data);
    console.log("🚀 ~ placeOrder ~ response:", response)

    if (redirect) {
      rkflInstance.openRedirect(response?.url)
    } else {
      rkflInstance.openIframe(response?.url)
    }

  } catch (err) {
    console.error("Failed to place order", err);
  }

}
