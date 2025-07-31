import { defineComponent, onMounted, h } from 'vue';

const FEATURE_PAYIN = {
    feature: "PAYIN", // Add other valid features
    style: 'default',
    containerStyle: 'default',
    containerId: 'default',
};
const FEATURE_AGE_VERIFICATION = {
    feature: "AGE_VERIFICATION", // Add other valid features
    style: 'default',
    containerStyle: 'default',
    containerId: 'default',
};
const paymentAppDomains = {
    prod: 'https://payments.rocketfuel.inc/select-currency',
    qa: 'https://qa-payment.rfdemo.co/select-currency',
    preprod: 'https://preprod-payment.rocketdemo.net/select-currency',
    sandbox: 'https://payments-sandbox.rocketfuelblockchain.com/select-currency',
};
const appDomains = {
    prod: 'http://localhost:3000',
    qa: 'http://localhost:3000',
    preprod: 'http://localhost:3000',
    sandbox: 'http://localhost:3000',
};
const ContainerId = 'sdk-buttons-container';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function dragElement() {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let iframeWrapper = document.createElement("div");
    let iframeWrapperHeader = document.createElement("div");
    iframeWrapper.id = "iframeWrapper";
    iframeWrapperHeader.id = "iframeWrapperHeader";
    iframeWrapper.style.cssText = 'width: 365px; position: fixed; z-index: 2147483647; top: 10px; right: 55px;';
    iframeWrapperHeader.style.cssText = 'padding: 3px;cursor: move;position: absolute;width: 387px;height: 2px;left: 10px;';
    iframeWrapper.onmousedown = dragMouseDown;
    iframeWrapper.appendChild(iframeWrapperHeader);
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        iframeWrapper.style.top = (iframeWrapper.offsetTop - pos2) + "px";
        iframeWrapper.style.left = (iframeWrapper.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
    return iframeWrapper;
}

class IframeUtiltites {
    static createIFrame(url) {
        const iframe = document.createElement('iframe');
        iframe.title = 'Rocketfuel';
        iframe.style.display = 'none';
        iframe.style.backgroundColor = 'transparent';
        iframe.style.border = '0';
        iframe.style.width = '410px';
        iframe.src = url;
        return iframe;
    }
    static showOverlay(url) {
        if (this.iframe) {
            this.iframe.src = url;
            return;
        }
        this.iframe = this.createIFrame(url);
        const wrapper = dragElement();
        this.iframe.style.display = 'block';
        this.iframe.style.height = '800px';
        this.iframe.style.border = '1px solid #dddddd';
        this.iframe.style.borderRadius = '8px';
        wrapper.appendChild(this.iframe);
        document.body.appendChild(wrapper);
    }
}

function getBaseUrl(env) {
    return paymentAppDomains[env];
}

// RocketFuel SDK - TypeScript Version
class RocketFuel {
    constructor(options) {
        this.rkflToken = null;
        this.clientId = options.clientId;
        this.domain = getBaseUrl(options.environment);
        this.initialize();
    }
    handleMessage(event) {
        const data = event.data;
        console.log("Received from iframe:", data);
    }
    initialize() {
        window.addEventListener("message", this.handleMessage);
    }
    openRedirect(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const open = `${this.domain}/${uuid}`;
            window.open(open, '_blank');
        });
    }
    openIframe(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const open = `${this.domain}/${uuid}`;
            IframeUtiltites.showOverlay(open);
        });
    }
}

let rkflInstance;
function placeOrder(clientId_1) {
    return __awaiter(this, arguments, void 0, function* (clientId, redirect = false, uuid, environment) {
        try {
            // Create instance for reuse if needed later
            rkflInstance = new RocketFuel({ clientId, environment });
            if (redirect) {
                rkflInstance.openRedirect(uuid);
            }
            else {
                rkflInstance.openIframe(uuid);
            }
        }
        catch (err) {
            console.error("Failed to place order", err);
        }
    });
}

class ZKP {
    constructor(clientId, env) {
        this.appUrl = appDomains[env];
        this.clientId = clientId;
    }
    initialize() {
        IframeUtiltites.showOverlay(this.appUrl);
        this.eventListnerConcodium();
    }
    eventListnerConcodium() {
        window.addEventListener('message', (event) => __awaiter(this, void 0, void 0, function* () {
            if (event.data.type === 'request_concordium') {
                const provider = window === null || window === void 0 ? void 0 : window.concordium;
                if (provider) {
                    // Use the provider in parent and relay only usable data
                    let account;
                    account = yield provider.getMostRecentlySelectedAccount();
                    if (!account) {
                        account = yield provider.connect();
                    }
                    event.source.postMessage({
                        type: 'concordium_response',
                        message: account,
                    }, event.origin);
                }
                else {
                    event.source.postMessage({
                        type: 'concordium_response',
                        message: { error: 'Provider not found' },
                    }, event.origin);
                }
            }
            if (event.data.type === 'concordium_requestVerifiablePresentation') {
                const provider = window === null || window === void 0 ? void 0 : window.concordium;
                if (provider) {
                    // Use the provider in parent and relay only usable data
                    const { statement, challenge } = event.data.payload;
                    provider.requestVerifiablePresentation(challenge, statement).then((d) => {
                        event.source.postMessage({
                            type: 'concordium_requestVerifiablePresentation_response',
                            message: 'verified',
                        }, event.origin);
                    }).catch((err) => {
                        event.source.postMessage({
                            type: 'concordium_requestVerifiablePresentation_error',
                            error: err,
                        }, event.origin);
                    });
                }
            }
        }));
    }
}

let zkpInstance;
const initializeWidget = (clientId, env) => {
    zkpInstance = new ZKP(clientId, env);
};
const launchWidget = () => {
    zkpInstance.initialize();
};

class RKFLPlugin {
    constructor(config) {
        this.redirect = false;
        this.payNowButton = null;
        this.clientId = config.clientId;
        this.buttons = config.plugins.length === 0 ? [FEATURE_PAYIN] : config.plugins;
        this.redirect = config.redirect || false;
        this.enviornment = config.environment || 'prod';
        this.uuid = '';
    }
    init() {
        const isPayinEnabled = this.buttons.find(v => v.feature === FEATURE_PAYIN.feature);
        // to-do clientid verification
        if (isPayinEnabled) {
            if (!this.clientId) {
                console.error('Client ID, Client Secret, and Merchant Id are required');
                return;
            }
        }
        else {
            if (!this.clientId) {
                console.error('Client ID is required');
                return;
            }
        }
        this.buttons.forEach((btnType) => {
            const button = document.createElement('button');
            button.style.minWidth = '250px';
            button.style.margin = '5px';
            button.style.padding = '8px 16px';
            button.style.border = '1px solid #e0e0e0';
            button.style.borderRadius = '999px'; // fully rounded pill shape
            button.style.backgroundColor = 'white';
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.gap = '8px';
            button.style.fontFamily = 'sans-serif';
            button.style.fontSize = '14px';
            button.style.color = '#1a1a1a';
            button.style.cursor = 'pointer';
            button.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.05)';
            switch (btnType.feature) {
                case FEATURE_PAYIN.feature:
                    button.innerHTML = `<img src="https://ik.imagekit.io/rocketfuel/icons/button-image.png?tr=w-30,h-30,fo-auto,q-50" alt=""> Pay with Cryto Currency`;
                    button.disabled = true; // Initially disabled
                    button.style.opacity = '0.4';
                    this.payNowButton = button;
                    const container = document.getElementById(btnType.containerId || ContainerId);
                    if (!container) {
                        console.error(`Container not found.`);
                        return;
                    }
                    button.onclick = () => __awaiter(this, void 0, void 0, function* () {
                        if (!this.uuid) {
                            console.warn('Cart data is not prepared');
                            return;
                        }
                        this.setLoadingState(true);
                        try {
                            yield placeOrder(this.clientId, this.redirect, this.uuid, this.enviornment);
                        }
                        catch (err) {
                            console.error('Error during order placement:', err);
                        }
                        finally {
                            this.setLoadingState(false);
                        }
                    });
                    container.appendChild(button);
                    break;
                case FEATURE_AGE_VERIFICATION.feature:
                    button.innerHTML = `<img src="https://ik.imagekit.io/rocketfuel/icons/button-image.png?tr=w-30,h-30,fo-auto,q-50" alt=""> Verification via Rocketfuel`;
                    button.onclick = () => this.ageVerification(this.enviornment);
                    const container2 = document.getElementById(btnType.containerId || ContainerId);
                    if (!container2) {
                        console.error(`Container not found.`);
                        return;
                    }
                    initializeWidget(this.clientId, this.enviornment);
                    container2.appendChild(button);
                    break;
                default:
                    console.warn(`Unknown button: ${btnType}`);
                    return;
            }
        });
    }
    prepareOrder(uuid) {
        this.uuid = uuid;
        if (this.payNowButton) {
            this.payNowButton.disabled = false;
            this.payNowButton.style.opacity = '1';
        }
    }
    setLoadingState(isLoading) {
        if (!this.payNowButton)
            return;
        if (isLoading) {
            this.payNowButton.disabled = true;
            this.payNowButton.innerText = 'Processing...';
        }
        else {
            this.payNowButton.disabled = false;
            this.payNowButton.innerText = 'Pay Now';
        }
    }
    ageVerification(env) {
        launchWidget();
    }
}
// ✅ Makes available globally
window.RkflPlugin = RKFLPlugin;

const RocketfuelButton = defineComponent({
    name: 'RocketfuelButton',
    props: {
        config: {
            type: Object,
            required: true,
        },
        uuid: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        onMounted(() => {
            const sdk = new RKFLPlugin(props.config);
            sdk.init();
            sdk.prepareOrder(props.uuid);
        });
        return () => { var _a; return h('div', { id: ((_a = props.config.plugins[0]) === null || _a === void 0 ? void 0 : _a.containerId) || ContainerId }); };
    },
});

export { RocketfuelButton };
