import { FEATURE_AGE_VERIFICATION } from "./constants";
import { dragElement } from "./dragger";
const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
export default class IframeUtiltites {
    public static iframe: HTMLIFrameElement | null = null;
    private static wrapper: HTMLDivElement | null = null;
    private static backdrop: HTMLDivElement | null = null;

    private static createIFrame(url: string) {
        const iframe = document.createElement('iframe');
        iframe.title = 'Rocketfuel';
        iframe.style.display = 'none';
        iframe.style.backgroundColor = 'transparent';
        iframe.style.border = '0';
        if(isMobile) {
            iframe.style.width = '100%';
        }
        iframe.style.minHeight = '500px'
        iframe.style.overflowY = 'auto';
        iframe.src = url;
        return iframe;
    }
    public static showOverlay(url: string, feature: string) {
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
            this.iframe.style.width = '365px';
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
        } else {
            this.iframe.style.width = '400px';
        }
        if (this.backdrop) {
            document.body.appendChild(this.backdrop)
        }

        this.iframe.style.display = 'block';
        this.iframe.style.minHeight = '100%';
        this.iframe.style.border = '1px solid #dddddd';
        this.iframe.style.borderRadius = '8px';
        this.iframe.style.background = '#F8F8F8';

        const iconUrl =
            "https://ik.imagekit.io/rocketfuel/icons/Ripple%20loading%20animation.gif";

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
            const origin = window.location.origin;
            this.iframe?.contentWindow?.postMessage({ type: 'parent_origin', origin }, '*');
            overlay.remove();
        });


        if (this.backdrop) {
           document.body.appendChild(this.backdrop)
        }
        overlay.appendChild(loader);
        wrapper.appendChild(this.iframe);
        wrapper.appendChild(overlay);
        document.body.appendChild(wrapper);
    }

    public static closeIframe() {
        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
        }
        if (this.backdrop && this.backdrop.parentNode) {
            this.backdrop.parentNode.removeChild(this.backdrop);
        }

        this.iframe = null;
        this.wrapper = null;
    }

    public static setIframeHeight(height: string) {
        if(this.iframe) {
            if(Number(height) >= Number(window.innerHeight)) {
                height = (window.innerHeight - 20).toString();
            }
            if(Number(height) <= (Number(window.innerHeight) / 2)) {
                height = (Number(window.innerHeight) / 2).toString();
            }
            
            this.iframe.style.height = `${height}px`;
        }
    }
}