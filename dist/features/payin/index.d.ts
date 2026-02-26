/** Input shape for order data validation (payload may have extra fields). */
interface OrderDataInput {
    amount: string;
    currency: string;
    cart: Array<{
        id: string;
        name: string;
        price: string;
        quantity: number;
    }>;
    customerInfo: {
        name: string;
        email: string;
    };
    merchant_id: string;
    customParameter?: {
        returnMethod: string;
        params: Array<{
            name: string;
            value: string;
        }>;
    };
    redirectUrl?: string;
}
export declare function verifyOrderData(data: OrderDataInput): {
    amount: string;
    currency: string;
    cart: {
        id: string;
        name: string;
        price: string;
        quantity: number;
    }[];
    customerInfo: {
        name: string;
        email: string;
    };
    customParameter: {
        returnMethod: string;
        params: Array<{
            name: string;
            value: string;
        }>;
    } | undefined;
    merchant_id: string;
    redirectUrl: string | undefined;
};
export declare function placeOrder(clientId: string, redirect: boolean | undefined, uuid: string, environment: 'production' | 'qa' | 'preprod' | 'sandbox'): Promise<void>;
export {};
