import type { IIframeService } from './core/IIframeService';
import type { SDKConfig, UserInfo } from './core/types';
export type { SDKConfig, UserInfo } from './core/types';
export declare class RKFLPlugin {
    private clientId;
    private buttons;
    private redirect;
    private uuid;
    private payNowButton;
    private userInfo;
    private environment;
    private iframeService;
    private zkpInitialized;
    private readonly innerHtmlPay;
    private readonly innerHtmlVerify;
    private readonly innerHtmlPayLoading;
    constructor(config: SDKConfig, iframeService?: IIframeService);
    init(): Promise<boolean | void>;
    setUserInfo(userInfo: UserInfo): void;
    prepareOrder(uuid: string): void;
    private handleMessage;
    private setLoadingState;
    launchAgeVerificationWidget(): Promise<void>;
    launchPaymentWidget(uuid: string): Promise<void>;
    verifyAgeVerification(auditId: string): Promise<unknown>;
}
