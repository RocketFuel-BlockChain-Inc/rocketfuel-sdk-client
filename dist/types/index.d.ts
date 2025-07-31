interface Buttons {
    feature: "PAYIN" | "AGE_VERIFICATION";
    style?: string;
    containerStyle?: string;
    containerId?: string;
}
interface SDKConfig {
    clientId: string;
    environment: "prod" | "qa" | "preprod" | "sandbox";
    redirect?: boolean;
    plugins: Buttons[];
}
declare class RKFLPlugin {
    private clientId;
    private buttons;
    private redirect;
    private uuid;
    private payNowButton;
    private enviornment;
    constructor(config: SDKConfig);
    init(): void;
    prepareOrder(uuid: any): void;
    private setLoadingState;
    private ageVerification;
}
export { RKFLPlugin };
export type { SDKConfig };
