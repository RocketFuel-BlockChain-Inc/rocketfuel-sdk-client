'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
    prod: "https://payments.rocketfuel.inc/select-currency",
    qa: "https://qa-payment.rfdemo.co/select-currency",
    preprod: "https://preprod-payment.rocketdemo.net/select-currency",
    sandbox: "https://payments-sandbox.rocketfuelblockchain.com/select-currency",
};
const appDomains = {
    prod: "http://localhost:3000",
    qa: "http://localhost:3000",
    preprod: "http://localhost:3000",
    sandbox: "https://rocketfuel-ccd.netlify.app",
};
const ContainerId = 'sdk-buttons-container';
const EVENTS = {
    AGE_VERIFICATION: "AGE_VERIFICATION",
    CLOSE_MODAL: "CLOSE_MODAL"
};

function dragElement(feature) {
    const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
    const iframeWrapper = document.createElement("div");
    const iframeWrapperHeader = document.createElement("div");
    iframeWrapper.id = "iframeWrapper";
    iframeWrapperHeader.id = "iframeWrapperHeader";
    if (feature === FEATURE_AGE_VERIFICATION.feature) {
        iframeWrapper.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 450px;
      height: 700px;
      background: white;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,0.15);
      border-radius: 8px;
    `;
    }
    else {
        iframeWrapper.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      top: 10%;
      right: 2%;
      width: 450px;
      height: 800px;
      background: white;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,0.15);
      border-radius: 8px;
    `;
    }
    iframeWrapperHeader.style.cssText = `
  height: 4px;
  width: 40%;
  cursor: move;
  position: absolute;
  background: #cecece;
  top: 0;
  left: 30%;
  transform: translateY(0);
  transition: all 0.3s ease;
  border-radius: 4px;
`;
    iframeWrapperHeader.title = 'Drag to move';
    // Hover effect (only for desktop)
    iframeWrapperHeader.onmouseenter = () => {
        if (!isMobile) {
            iframeWrapperHeader.style.height = '14px';
            iframeWrapperHeader.style.background = `#cecece`;
        }
    };
    iframeWrapperHeader.onmouseup = () => {
        if (!isMobile) {
            iframeWrapperHeader.style.height = '4px';
            iframeWrapperHeader.style.background = '#cecece';
        }
        closeDragElement();
    };
    // Dragging only enabled for non-mobile
    if (!isMobile) {
        iframeWrapperHeader.onmousedown = dragMouseDown;
    }
    else {
        // Fullscreen style for mobile
        iframeWrapper.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  `;
    }
    // Attach header
    iframeWrapper.appendChild(iframeWrapperHeader);
    // Dragging handlers
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        iframeWrapper.style.top = (iframeWrapper.offsetTop - pos2) + "px";
        iframeWrapper.style.left = (iframeWrapper.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
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
        iframe.style.width = '100%';
        iframe.style.overflowY = 'auto';
        iframe.src = url;
        return iframe;
    }
    static showOverlay(url, feature) {
        if (this.iframe) {
            this.iframe.src = url;
            return;
        }
        // Create iframe and wrapper
        this.iframe = this.createIFrame(url);
        const wrapper = dragElement(feature);
        this.wrapper = wrapper;
        // add backdrop
        if (feature === FEATURE_AGE_VERIFICATION.feature) {
            this.backdrop = document.createElement('div');
            this.backdrop.style.backgroundColor = '#000000';
            this.backdrop.style.position = 'fixed';
            this.backdrop.style.width = '100%';
            this.backdrop.style.height = '100%';
            this.backdrop.style.top = '0';
            this.backdrop.style.bottom = '0';
            this.backdrop.style.left = '0';
            this.backdrop.style.right = '0';
            this.backdrop.style.zIndex = '2147483645';
            this.backdrop.style.opacity = '0.6';
            this.backdrop.id = 'backdrop-age-verification';
        }
        if (this.backdrop) {
            document.body.appendChild(this.backdrop);
        }
        this.iframe.style.display = 'block';
        this.iframe.style.minHeight = '100%';
        this.iframe.style.border = '1px solid #dddddd';
        this.iframe.style.borderRadius = '8px';
        this.iframe.style.background = '#F8F8F8';
        const iconUrl = "https://ik.imagekit.io/rocketfuel/icons/Ripple%20loading%20animation.gif";
        // Create overlay
        const overlay = document.createElement("div");
        overlay.id = "rkfl-loader-overlay";
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.border = '1px solid #dddddd';
        overlay.style.borderRadius = '8px';
        overlay.style.backgroundColor = "#F8F8F8";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "9998";
        // Create loader image
        const loader = document.createElement("img");
        loader.src = iconUrl;
        loader.alt = "Loading";
        loader.style.transform = "translate(-50%, -50%)";
        loader.style.position = "absolute";
        loader.style.top = "50%";
        loader.style.left = "52%";
        // Remove loader on iframe load
        this.iframe.addEventListener("load", () => {
            var _a, _b;
            const origin = window.location.origin;
            (_b = (_a = this.iframe) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.postMessage({ type: 'parent_origin', origin }, '*');
            overlay.remove();
        });
        if (this.backdrop) {
            document.body.appendChild(this.backdrop);
        }
        overlay.appendChild(loader);
        wrapper.appendChild(this.iframe);
        wrapper.appendChild(overlay);
        document.body.appendChild(wrapper);
    }
    static closeIframe() {
        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
        }
        if (this.backdrop && this.backdrop.parentNode) {
            this.backdrop.parentNode.removeChild(this.backdrop);
        }
        this.iframe = null;
        this.wrapper = null;
    }
}
IframeUtiltites.iframe = null;
IframeUtiltites.wrapper = null;
IframeUtiltites.backdrop = null;

class ZKP {
    constructor(clientId, env, redirect) {
        this.appUrl = appDomains[env];
        this.clientId = clientId;
        this.redirect = redirect;
    }
    initialize() {
        if (this.redirect) {
            this.openRedirect(`${this.appUrl}?clientId=${this.clientId}`);
        }
        else {
            IframeUtiltites.showOverlay(this.appUrl, FEATURE_AGE_VERIFICATION.feature);
            this.eventListnerConcodium();
        }
    }
    openRedirect(url) {
        window.open(url, '_blank');
    }
    eventListnerConcodium() {
        window.addEventListener('message', (event) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (event.data.type === 'request_connected_account') {
                const provider = window === null || window === void 0 ? void 0 : window.concordium;
                if (provider) {
                    // Use the provider in parent and relay only usable data
                    let account;
                    account = yield provider.getMostRecentlySelectedAccount();
                    event.source.postMessage({
                        type: 'concordium_response',
                        message: account || null,
                    }, event.origin);
                }
                else {
                    event.source.postMessage({
                        type: 'concordium_response',
                        message: { error: 'Provider not found' },
                    }, event.origin);
                }
            }
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
                    provider.requestVerifiablePresentation(challenge, statement).then((data) => {
                        event.source.postMessage({
                            type: 'concordium_requestVerifiablePresentation_response',
                            message: 'verified',
                            data
                        }, event.origin);
                    }).catch((err) => {
                        event.source.postMessage({
                            type: 'concordium_requestVerifiablePresentation_error',
                            error: err,
                        }, event.origin);
                    });
                }
            }
            if (((_a = event.data) === null || _a === void 0 ? void 0 : _a.eventType) === "accountDisconnected") {
                (_c = (_b = IframeUtiltites.iframe) === null || _b === void 0 ? void 0 : _b.contentWindow) === null || _c === void 0 ? void 0 : _c.postMessage('concordium_disconnected', IframeUtiltites.iframe.src);
            }
        }));
    }
}

let zkpInstance;
const initializeWidget = (clientId, env, redirect) => {
    zkpInstance = new ZKP(clientId, env, redirect);
};
const launchAgeVerificationWidget = () => {
    if (!zkpInstance) {
        throw new Error('SDK not initialized properly');
    }
    zkpInstance.initialize();
};

function getBaseUrl(env) {
    return paymentAppDomains[env];
}

// RocketFuel SDK - TypeScript Version
class RocketFuel {
    constructor(options) {
        this.rkflToken = null;
        this.success_event = "rocketfuel_result_ok";
        this.clientId = options.clientId;
        this.domain = getBaseUrl(options.environment);
        this.initialize();
    }
    handleMessage(event) {
        const eventData = event.data;
        if (eventData.type === this.success_event) {
            if (eventData.paymentCompleted === 1) {
                const t = setTimeout(() => {
                    IframeUtiltites.closeIframe();
                    t !== null && t !== void 0 ? t : clearTimeout(t);
                }, 5000);
            }
        }
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
            IframeUtiltites.showOverlay(open, FEATURE_PAYIN.feature);
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

class RKFLPlugin {
    constructor(config) {
        this.redirect = false;
        this.payNowButton = null;
        this.innerHtmlPay = '<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Pay with Cryto Currency';
        this.innerHtmlVerify = `<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Verification via Rocketfuel`;
        this.innerHtmlPayLoading = `<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Processing...`;
        config.environment;
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
                console.error('Client ID is required');
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
                    button.innerHTML = this.innerHtmlPay;
                    button.disabled = true; // Initially disabled
                    button.style.opacity = '0.4';
                    this.payNowButton = button;
                    button.id = '#pay';
                    const container = document.getElementById(btnType.containerId || ContainerId);
                    if (!container) {
                        console.error(`Container not found.`);
                        return;
                    }
                    button.onclick = () => __awaiter(this, void 0, void 0, function* () {
                        if (IframeUtiltites.iframe) {
                            return;
                        }
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
                    if (!document.getElementById('#pay')) {
                        container.appendChild(button);
                    }
                    break;
                case FEATURE_AGE_VERIFICATION.feature:
                    button.innerHTML = this.innerHtmlVerify;
                    button.onclick = () => this.ageVerification(this.enviornment);
                    button.id = '#age';
                    const container2 = document.getElementById(btnType.containerId || ContainerId);
                    if (!container2) {
                        console.error(`Container not found.`);
                        return;
                    }
                    initializeWidget(this.clientId, this.enviornment, this.redirect);
                    if (btnType.inject === undefined || btnType.inject === null || btnType.inject) {
                        if (!document.getElementById('#age')) {
                            container2.appendChild(button);
                        }
                    }
                    break;
                default:
                    console.warn(`Unknown button: ${btnType}`);
                    return;
            }
        });
        // modal listner
        window.addEventListener("message", this.handleMessage);
    }
    prepareOrder(uuid) {
        this.uuid = uuid;
        if (this.payNowButton) {
            this.payNowButton.disabled = false;
            this.payNowButton.style.opacity = '1';
        }
    }
    handleMessage(event) {
        const data = event.data;
        if (data.type === EVENTS.CLOSE_MODAL) {
            IframeUtiltites.closeIframe();
        }
    }
    setLoadingState(isLoading) {
        if (!this.payNowButton)
            return;
        if (isLoading) {
            this.payNowButton.disabled = true;
            this.payNowButton.innerHTML = this.innerHtmlPayLoading;
        }
        else {
            this.payNowButton.disabled = false;
            this.payNowButton.innerHTML = this.innerHtmlPay;
        }
    }
    ageVerification(env) {
        launchAgeVerificationWidget();
    }
}

exports.RkflPlugin = RKFLPlugin;
exports["default"] = RKFLPlugin;
exports.launchAgeVerificationWidget = launchAgeVerificationWidget;
