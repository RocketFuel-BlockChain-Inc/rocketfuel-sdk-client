import { UserInfo } from './types';
/** Minimal type for Concordium wallet provider (browser extension). */
interface ConcordiumProvider {
    getSelectedChain(): Promise<string | undefined>;
    getMostRecentlySelectedAccount(): Promise<unknown>;
    connect(): Promise<unknown>;
    requestVerifiablePresentation(challenge: string, statement: unknown): Promise<unknown>;
}
declare global {
    interface Window {
        concordium?: ConcordiumProvider;
    }
}
export declare class ZKP {
    private appUrl;
    private clientId;
    private redirect;
    constructor(clientId: string, env: 'production' | 'qa' | 'preprod' | 'sandbox', redirect: boolean);
    initialize(userInfo?: UserInfo): void;
    private openRedirect;
    private handler;
    private eventListnerConcodium;
}
export {};
