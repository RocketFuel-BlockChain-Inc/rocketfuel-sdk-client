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
    public static showOverlay(url: string, showCross: boolean = false) {
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
        this.iframe.style.backgroundColor = '#F8F8F8';

        // Add loader
        const iconUrl =
            "https://ik.imagekit.io/rocketfuel/icons/button-image.png?tr=w-100,h-100,fo-auto";
        const loader = document.createElement("img");
        loader.src = iconUrl;
        loader.alt = "Loading";
        loader.style.position = "absolute";
        loader.style.top = "49%";
        loader.style.left = "58%";
        loader.style.transform = "translate(-50%, -50%)";
        loader.style.width = "100px";
        loader.style.height = "100px";
        loader.style.zIndex = "9999";
        loader.style.animation = "rkfl-pendulum 1s infinite ease-in-out alternate";

        // Append animation CSS
        if (!document.getElementById("rkfl-spinner-style")) {
            const style = document.createElement("style");
            style.id = "rkfl-spinner-style";
            style.textContent = `
        @keyframes rkfl-pendulum {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          50%  { transform: translate(-50%, -50%) rotate(140deg); }
          100% { transform: translate(-50%, -50%) rotate(0deg); }
        }
      `;
            document.head.appendChild(style);
        }

        // Remove loader on iframe load
        this.iframe.addEventListener("load", () => {
            loader.remove();
        });

        // Add close button
        if (showCross) {
            const closeBtn = document.createElement('div');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '-6px';
            closeBtn.style.right = '-37px';
            closeBtn.style.fontSize = '30px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.zIndex = '10000';

            closeBtn.addEventListener('click', () => {
                if (this.wrapper) {
                    document.body.removeChild(this.wrapper);
                    this.wrapper = null;
                    this.iframe = null;
                }
            });

            wrapper.appendChild(closeBtn);
        }

        wrapper.appendChild(this.iframe);
        wrapper.appendChild(loader);
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