import { dragElement } from "./dragger";

export default class IframeUtiltites {
    public static iframe: HTMLIFrameElement | null = null;
    private static wrapper: HTMLDivElement | null = null;

    private static createIFrame(url: string) {
        const iframe = document.createElement('iframe');
        iframe.title = 'Rocketfuel';
        iframe.style.display = 'none';
        iframe.style.backgroundColor = 'transparent';
        iframe.style.border = '0';
        iframe.style.width = '100%';
        iframe.src = url;
        return iframe;
    }
    public static showOverlay(url: string) {
        if (this.iframe) {
            this.iframe.src = url;
            return;
        }

        // Create iframe and wrapper
        this.iframe = this.createIFrame(url);
        const wrapper = dragElement();
        this.wrapper = wrapper;

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

        overlay.appendChild(loader);
        wrapper.appendChild(this.iframe);
        wrapper.appendChild(overlay);
        document.body.appendChild(wrapper);
    }

    public static closeIframe() {
        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
        }

        this.iframe = null;
        this.wrapper = null;
    }
}