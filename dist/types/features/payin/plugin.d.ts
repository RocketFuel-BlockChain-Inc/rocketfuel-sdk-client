import { RocketFuelOptions } from "./types";
declare global {
    interface Window {
        token: string;
        refresh: string;
    }
}
declare class RocketFuel {
    private domain;
    rkflToken: any;
    clientId: string;
    constructor(options: RocketFuelOptions);
    handleMessage(event: MessageEvent): void;
    private initialize;
    openRedirect(uuid: string): Promise<void>;
    openIframe(uuid: string): Promise<void>;
}
export default RocketFuel;
