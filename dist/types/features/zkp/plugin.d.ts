declare global {
    interface Window {
        concordium: any;
    }
}
export declare class ZKP {
    private appUrl;
    private clientId;
    constructor(clientId: string, env: "prod" | "qa" | "preprod" | "sandbox");
    initialize(): void;
    eventListnerConcodium(): void;
}
