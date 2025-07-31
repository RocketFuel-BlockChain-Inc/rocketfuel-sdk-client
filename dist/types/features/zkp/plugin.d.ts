declare global {
    interface Window {
        concordium: any;
    }
}
export declare class ZKP {
    private appUrl;
    private clientId;
    private redirect;
    constructor(clientId: string, env: "prod" | "qa" | "preprod" | "sandbox", redirect: boolean);
    initialize(): void;
    private openRedirect;
    private eventListnerConcodium;
}
