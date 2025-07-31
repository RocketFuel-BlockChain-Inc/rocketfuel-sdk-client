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
        iframe.style.width = '410px';
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
        this.iframe.style.height = '800px';
        this.iframe.style.border = '1px solid #dddddd';
        this.iframe.style.borderRadius = '8px';
        this.iframe.style.background = '#F8F8F8';

        const iconUrl =
            "https://ik.imagekit.io/rocketfuel/icons/button-image.png?updatedAt=1754002605547&tr=w-100,h-100,fo-auto";

        // Create overlay
        const overlay = document.createElement("div");
        overlay.id = "rkfl-loader-overlay";
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "410px";
        overlay.style.height = "100%";
        overlay.style.border = '1px solid #dddddd';
        overlay.style.borderRadius = '8px';
        overlay.style.backgroundColor = "rgba(255, 255, 255, 1)";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "9998";

        // Create loader image
        const loader = document.createElement("img");
        loader.src = iconUrl;
        loader.alt = "Loading";
        loader.style.width = "100px";
        loader.style.height = "100px";
        loader.style.animation = "rkfl-pendulum 3s ease-in-out infinite";
        loader.style.transform = "translate(-55%, -50%)";
        loader.style.position = "absolute";
        loader.style.top = "50%";
        loader.style.left = "52%";
        // Append loader to overlay
        // Append animation CSS
        if (!document.getElementById("rkfl-spinner-style")) {
            const style = document.createElement("style");
            style.id = "rkfl-spinner-style";
            style.textContent = `
            @keyframes rkfl-pendulum {
                0%   { transform: translate(-50%, -50%) rotate(0deg); }
                10%  { transform: translate(-50%, -50%) rotate(30deg); }
                25%  { transform: translate(-50%, -50%) rotate(90deg); }
                40%  { transform: translate(-50%, -50%) rotate(150deg); }
                50%  { transform: translate(-50%, -50%) rotate(180deg); }
                60%  { transform: translate(-50%, -50%) rotate(210deg); }
                75%  { transform: translate(-50%, -50%) rotate(270deg); }
                90%  { transform: translate(-50%, -50%) rotate(330deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
      `;
            document.head.appendChild(style);
        }

        // Remove loader on iframe load
        this.iframe.addEventListener("load", () => {
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