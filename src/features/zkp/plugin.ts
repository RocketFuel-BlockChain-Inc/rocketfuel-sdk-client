import { appDomains } from "../../utils/constants";
import { dragElement } from "../../utils/dragger";
import IframeUtiltites from "../../utils/IframeUtilities";
declare global {
    interface Window {
        concordium: any;
    }
}
export class ZKP {
    private appUrl: string;
    private clientId: string;
    constructor(clientId: string, env: "prod" | "qa" | "preprod" | "sandbox") {
        this.appUrl = appDomains[env];
        this.clientId = clientId;
    }
    initialize() {
        IframeUtiltites.showOverlay(this.appUrl)
        this.eventListnerConcodium()
    }

    eventListnerConcodium() {
        window.addEventListener('message', async (event: any) => {
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
                    provider.requestVerifiablePresentation(challenge, statement).then((d: any) => {
                        event.source.postMessage(
                            {
                                type: 'concordium_requestVerifiablePresentation_response',
                                message: 'verified',
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
        });
    }


}