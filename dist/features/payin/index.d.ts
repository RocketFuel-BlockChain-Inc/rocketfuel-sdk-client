export declare function verifyOrderData(data: any): {
    amount: any;
    currency: any;
    cart: any;
    customerInfo: any;
    customParameter: any;
    merchant_id: any;
    redirectUrl: any;
};
export declare function placeOrder(clientId: string, redirect: Boolean | undefined, uuid: string, environment: any): Promise<void>;
