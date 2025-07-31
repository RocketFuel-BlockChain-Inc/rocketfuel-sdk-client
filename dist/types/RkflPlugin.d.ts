interface Buttons {
    feature: "PAYIN" | "AGE_VERIFICATION";
    style?: string;
    containerStyle?: string;
    containerId?: string;
}
export interface SDKConfig {
    clientId: string;
    environment: "prod" | "qa" | "preprod" | "sandbox";
    redirect?: boolean;
    plugins: Buttons[];
}
export declare class RKFLPlugin {
    private clientId;
    private buttons;
    private redirect;
    private uuid;
    private payNowButton;
    private enviornment;
    private innerHtmlPay;
    private innerHtmlVerify;
    private innerHtmlPayLoading;
    constructor(config: SDKConfig);
    init(): void;
    prepareOrder(uuid: any): void;
    private handleMessage;
    private setLoadingState;
    private ageVerification;
}
export {};
