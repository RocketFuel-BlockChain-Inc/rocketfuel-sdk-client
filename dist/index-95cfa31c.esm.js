import { a as appDomains, I as IframeUtiltites, b as FEATURE_AGE_VERIFICATION, _ as __awaiter } from './index-2427efa4.esm.js';
import 'crypto-js';

class ZKP {
    constructor(clientId, env, redirect) {
        this.appUrl = appDomains[env];
        this.clientId = clientId;
        this.redirect = redirect;
    }
    initialize(userInfo) {
        if (this.redirect) {
            let params = null;
            if (userInfo) {
                params = new URLSearchParams(JSON.parse(JSON.stringify(userInfo))).toString();
            }
            this.openRedirect(`${this.appUrl}?clientId=${btoa(this.clientId)}&${params}`);
        }
        else {
            IframeUtiltites.showOverlay(`${this.appUrl}`, FEATURE_AGE_VERIFICATION.feature);
            this.eventListnerConcodium();
        }
    }
    openRedirect(url) {
        window.open(url, '_blank');
    }
    handler(event) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const provider = () => window === null || window === void 0 ? void 0 : window.concordium;
            const respond = (type, message, target, origin) => {
                target.postMessage({ type, message }, origin);
            };
            const { type, chain, payload, eventType } = event.data || {};
            const target = event.source;
            const origin = event.origin;
            try {
                // Disconnect event
                if (eventType === 'accountDisconnected') {
                    (_b = (_a = IframeUtiltites.iframe) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.postMessage('concordium_disconnected', IframeUtiltites.iframe.src);
                    return;
                }
                if (!type)
                    return; // skip if not a Concordium message
                switch (type) {
                    case 'request_connected_account': {
                        const prov = provider();
                        if (!prov) {
                            respond('concordium_response', { error: 'No wallet detected. Please install a supported wallet to continue.' }, target, origin);
                            return;
                        }
                        const selectedChain = yield (prov === null || prov === void 0 ? void 0 : prov.getSelectedChain());
                        if (selectedChain && !(selectedChain === null || selectedChain === void 0 ? void 0 : selectedChain.includes(chain))) {
                            respond('concordium_response', {
                                error: 'You are connected to the wrong network. Please switch to the correct chain to continue.',
                            }, target, origin);
                            return;
                        }
                        const account = yield prov.getMostRecentlySelectedAccount();
                        respond('concordium_response', account || null, target, origin);
                        break;
                    }
                    case 'request_concordium': {
                        const prov = provider();
                        if (!prov) {
                            respond('concordium_response', { error: 'No wallet detected. Please install a supported wallet to continue.' }, target, origin);
                            return;
                        }
                        const selectedChain = yield (prov === null || prov === void 0 ? void 0 : prov.getSelectedChain());
                        if (selectedChain && !(selectedChain === null || selectedChain === void 0 ? void 0 : selectedChain.includes(chain))) {
                            respond('concordium_response', {
                                error: 'You are connected to the wrong network. Please switch to the correct chain to continue.',
                            }, target, origin);
                            return;
                        }
                        let account = yield prov.getMostRecentlySelectedAccount();
                        if (!account)
                            account = yield prov.connect();
                        respond('concordium_response', account, target, origin);
                        break;
                    }
                    case 'concordium_requestVerifiablePresentation': {
                        const prov = provider();
                        if (!prov)
                            return;
                        const { statement, challenge, chain } = payload;
                        const verificationAnchor = {
                            challenge,
                            credentialStatements: statement,
                        };
                        try {
                            const selectedChain = yield (prov === null || prov === void 0 ? void 0 : prov.getSelectedChain());
                            if (selectedChain && !(selectedChain === null || selectedChain === void 0 ? void 0 : selectedChain.includes(chain))) {
                                target.postMessage({
                                    type: 'concordium_requestVerifiablePresentation_error',
                                    error: {
                                        message: 'You are connected to the wrong network. Please switch to the correct chain to continue.',
                                    },
                                }, origin);
                                return;
                            }
                            const data = yield prov.requestVerifiablePresentation(challenge, statement);
                            const response = {
                                logData: { verifiablePresentationJson: JSON.stringify(data) },
                                verificationAnchor,
                            };
                            target.postMessage({
                                type: 'concordium_requestVerifiablePresentation_response',
                                message: 'verified',
                                data: response,
                            }, origin);
                        }
                        catch (err) {
                            target.postMessage({ type: 'concordium_requestVerifiablePresentation_error', error: err }, origin);
                        }
                        break;
                    }
                }
            }
            catch (err) {
                respond('concordium_response', { error: err instanceof Error ? err.message : 'Something went wrong' }, target, origin);
            }
        });
    }
    eventListnerConcodium() {
        // remove handler
        window.removeEventListener('message', this.handler);
        window.addEventListener('message', this.handler);
        // use a named cleanup function to avoid stacking
        const cleanup = () => {
            window.removeEventListener('message', this.handler);
            window.removeEventListener('beforeunload', cleanup);
        };
        window.removeEventListener('beforeunload', cleanup);
        window.addEventListener('beforeunload', cleanup);
    }
}

let zkpInstance;
const initializeWidget = (clientId, env, redirect) => {
    zkpInstance = new ZKP(clientId, env, redirect);
};
const launchAgeVerificationWidget = (userInfo) => {
    if (!zkpInstance) {
        throw new Error('SDK not initialized properly');
    }
    zkpInstance.initialize(userInfo);
};

export { initializeWidget, launchAgeVerificationWidget };
