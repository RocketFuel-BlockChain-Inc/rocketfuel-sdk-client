import RocketFuel from './plugin';

let rkflInstance: RocketFuel;
export function verifyOrderData(data: any) {
  // Basic format check
  if (
    typeof data !== 'object' || !data ||
    typeof data.amount !== 'string' ||
    typeof data.currency !== 'string' ||
    !Array.isArray(data.cart) ||
    typeof data.customerInfo !== 'object' ||
    typeof data.customerInfo.name !== 'string' ||
    typeof data.customerInfo.email !== 'string' ||
    typeof data.merchant_id !== 'string'
  ) {
    throw new Error('Invalid order data format')

  }

  // Optionally, validate each cart item
  for (const item of data.cart) {
    if (
      typeof item.id !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.price !== 'string' ||
      typeof item.quantity !== 'number'
    ) {
      throw new Error("Invalid cart item format");
    }
  }

  // Optional: validate customParameter
  if (data.customParameter) {
    if (
      typeof data.customParameter.returnMethod !== 'string' ||
      !Array.isArray(data.customParameter.params)
    ) {
      throw new Error("Invalid customParameter format");
    }
    for (const param of data.customParameter.params) {
      if (
        typeof param.name !== 'string' ||
        typeof param.value !== 'string'
      ) {
        throw new Error("Invalid param format inside customParameter");
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

export async function placeOrder(clientId: string, redirect: Boolean = false, uuid: string, environment: any) {
  try {
    // Create instance for reuse if needed later
    rkflInstance = new RocketFuel({ clientId, environment });
    if (redirect) {
      rkflInstance.openRedirect(uuid)
    } else {
      rkflInstance.openIframe(uuid)
    }

  } catch (err) {
    console.error("Failed to place order", err);
  }

}
