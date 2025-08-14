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
    constructor(clientId: string, env: "prod" | "qa" | "preprod" | "sandbox", redirect: boolean) {
        this.appUrl = appDomains[env];
        this.clientId = clientId;
        this.redirect = redirect;
    }
    public initialize(userInfo?: UserInfo) {
        if (this.redirect) {
            let params = null;
            if(userInfo) {
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

    private eventListnerConcodium() {
        window.addEventListener('message', async (event: any) => {
            if (event.data.type === 'request_connected_account') {
                const provider = window?.concordium;
                if (provider) {
                    // Use the provider in parent and relay only usable data
                    let account;
                    account = await provider.getMostRecentlySelectedAccount();
                    event.source.postMessage(
                        {
                            type: 'concordium_response',
                            message: account || null,
                        },
                        event.origin
                    );
                } else {
                    event.source.postMessage(
                        {
                            type: 'concordium_response',
                            message: { error: 'Provider not found' },
                        },
                        event.origin
                    );
                }
            }
            if (event.data.type === 'request_concordium') {
                const provider = window?.concordium;

                if (provider) {
                    // Use the provider in parent and relay only usable data
                    let account;
                    account = await provider.getMostRecentlySelectedAccount()
                    if (!account) {
                        account = await provider.connect();
                    }
                    event.source.postMessage(
                        {
                            type: 'concordium_response',
                            message: account,
                        },
                        event.origin
                    );
                } else {

                    event.source.postMessage(
                        {
                            type: 'concordium_response',
                            message: { error: 'Provider not found' },
                        },
                        event.origin
                    );
                }
            }
            if (event.data.type === 'concordium_requestVerifiablePresentation') {

                const provider = window?.concordium;

                if (provider) {
                    // Use the provider in parent and relay only usable data
                    const { statement, challenge } = event.data.payload;
                    provider.requestVerifiablePresentation(challenge, statement).then((data: any) => {
                        event.source.postMessage(
                            {
                                type: 'concordium_requestVerifiablePresentation_response',
                                message: 'verified',
                                data
                            },
                            event.origin
                        );
                    }).catch((err: any) => {
                        event.source.postMessage(
                            {
                                type: 'concordium_requestVerifiablePresentation_error',
                                error: err,
                            },
                            event.origin
                        );
                    })

                }
            }
            if (event.data?.eventType === "accountDisconnected") {
                IframeUtiltites.iframe?.contentWindow?.postMessage('concordium_disconnected',
                    IframeUtiltites.iframe.src
                )
            }
        });
    }


}