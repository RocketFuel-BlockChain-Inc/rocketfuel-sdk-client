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
        console.log('this.appruk', this.appUrl)
        IframeUtiltites.showOverlay(this.appUrl)
        this.eventListnerConcodium()
    }

    eventListnerConcodium() {
        window.addEventListener('message', async (event: any) => {
            console.log(event);
            if (event.data.type === 'request_concordium') {
                console.log('received request for concordium')
                const provider = window.concordium;
                if (provider) {
                    // Use the provider in parent and relay only usable data
                    event.source.postMessage(
                        {
                            type: 'concordium_response',
                            message: { provider }, // Only send serializable data
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
        });
    }


}