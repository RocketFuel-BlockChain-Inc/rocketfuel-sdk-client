import { UserInfo } from './features/zkp/types';
interface Buttons {
    feature: "PAYIN" | "AGE_VERIFICATION";
    style?: string;
    containerStyle?: string;
    containerId?: string;
    inject?: boolean;
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
    private userInfo;
    private enviornment;
    private innerHtmlPay;
    private innerHtmlVerify;
    private innerHtmlPayLoading;
    constructor(config: SDKConfig);
    init(): Promise<Boolean | void>;
    setUserInfo(userInfo: UserInfo): void;
    prepareOrder(uuid: any): void;
    private handleMessage;
    private setLoadingState;
    launchAgeVerificationWidget(): void;
}
export {};
