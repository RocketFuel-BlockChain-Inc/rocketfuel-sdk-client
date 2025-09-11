import { UserInfo } from "./types";
declare global {
    interface Window {
        concordium: any;
    }
}
export declare class ZKP {
    private appUrl;
    private clientId;
    private redirect;
    constructor(clientId: string, env: "production" | "qa" | "preprod" | "sandbox", redirect: boolean);
    initialize(userInfo?: UserInfo): void;
    private openRedirect;
    private handler;
    private eventListnerConcodium;
}
