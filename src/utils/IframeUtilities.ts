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

        this.iframe = this.createIFrame(url);
        const wrapper = dragElement();
        this.wrapper = wrapper;

        this.iframe.style.display = 'block';
        this.iframe.style.height = '800px';
        this.iframe.style.border = '1px solid #dddddd';
        this.iframe.style.borderRadius = '8px';

        if (showCross) {
            const closeBtn = document.createElement('div');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '4px';
            closeBtn.style.right = '2px';
            closeBtn.style.fontSize = '30px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.zIndex = '10000';

            closeBtn.addEventListener('click', () => {
                console.log('adding click')
                if (this.wrapper) {
                    document.body.removeChild(this.wrapper);
                    this.wrapper = null;
                    this.iframe = null;
                }
            });

            wrapper.appendChild(closeBtn);
        }

        wrapper.appendChild(this.iframe);
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