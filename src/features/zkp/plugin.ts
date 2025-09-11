import { appDomains, FEATURE_AGE_VERIFICATION } from "../../utils/constants";
import IframeUtiltites from "../../utils/IframeUtilities";
import { UserInfo } from "./types";
declare global {
    interface Window {
        concordium: any;
    }
}
export class ZKP {
    private appUrl: string;
    private clientId: string;
    private redirect: boolean;
    constructor(clientId: string, env: "production" | "qa" | "preprod" | "sandbox", redirect: boolean) {
        this.appUrl = appDomains[env];
        this.clientId = clientId;
        this.redirect = redirect;
    }
    public initialize(userInfo?: UserInfo) {
        if (this.redirect) {
            let params = null;
            if (userInfo) {
                params = new URLSearchParams(JSON.parse(JSON.stringify(userInfo))).toString()
            }
            this.openRedirect(`${this.appUrl}?clientId=${btoa(this.clientId)}&${params}`)
        } else {
            IframeUtiltites.showOverlay(`${this.appUrl}`,
                FEATURE_AGE_VERIFICATION.feature)
            this.eventListnerConcodium();
        }
    }

    private openRedirect(url: string) {
        window.open(url, '_blank')
    }

    private async handler(event: MessageEvent) {

        const provider = () => window?.concordium;

        const respond = (type: string, message: any, target: Window, origin: string) => {
            target.postMessage({ type, message }, origin);
        };
        const { type, chain, payload, eventType } = event.data || {};
        const target = event.source as Window;
        const origin = event.origin;

        // Disconnect event
        if (eventType === "accountDisconnected") {
            IframeUtiltites.iframe?.contentWindow?.postMessage(
                'concordium_disconnected',
                IframeUtiltites.iframe.src
            );
            return;
        }

        if (!type) return; // skip if not a Concordium message

        switch (type) {
            case 'request_connected_account': {
                const prov = provider();
                if (!prov) {
                    respond('concordium_response', { error: 'No wallet detected. Please install a supported wallet to continue.' }, target, origin);
                    return;
                }

                const selectedChain = await prov?.getSelectedChain();
                if (selectedChain && !selectedChain?.includes(chain)) {
                    respond('concordium_response', { error: 'You are connected to the wrong network. Please switch to the correct chain to continue.' }, target, origin);
                    return;
                }

                const account = await prov.getMostRecentlySelectedAccount();
                respond('concordium_response', account || null, target, origin);
                break;
            }

            case 'request_concordium': {
                const prov = provider();
                if (!prov) {
                    respond('concordium_response', { error: 'No wallet detected. Please install a supported wallet to continue.' }, target, origin);
                    return;
                }

                const selectedChain = await prov?.getSelectedChain();
                if (selectedChain && !selectedChain?.includes(chain)) {
                    respond('concordium_response', { error: 'You are connected to the wrong network. Please switch to the correct chain to continue.' }, target, origin);
                    return;
                }

                let account = await prov.getMostRecentlySelectedAccount();
                if (!account) account = await prov.connect();

                respond('concordium_response', account, target, origin);
                break;
            }

            case 'concordium_requestVerifiablePresentation': {
                const prov = provider();
                if (!prov) return;
                const { statement, challenge, chain } = payload;
                try {
                    const selectedChain = await prov?.getSelectedChain();
                    if (selectedChain && !selectedChain?.includes(chain)) {
                        target.postMessage(
                            {
                                type: 'concordium_requestVerifiablePresentation_error', error: {
                                    message: 'You are connected to the wrong network. Please switch to the correct chain to continue.'
                                }
                            },
                            origin
                        );
                        return;
                    }
                    const data = await prov.requestVerifiablePresentation(challenge, statement);
                    target.postMessage(
                        { type: 'concordium_requestVerifiablePresentation_response', message: 'verified', data },
                        origin
                    );
                } catch (err) {
                    target.postMessage(
                        { type: 'concordium_requestVerifiablePresentation_error', error: err },
                        origin
                    );
                }
                break;
            }
        }
    }
    private eventListnerConcodium() {
        window.addEventListener('message', this.handler);
        window.addEventListener('beforeunload', () => {
            window.removeEventListener('message', this.handler);
        });
    }



}