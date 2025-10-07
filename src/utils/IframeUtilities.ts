import { FEATURE_AGE_VERIFICATION } from "./constants";
import { dragElement } from "./dragger";
export const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
export default class IframeUtiltites {
    public static iframe: HTMLIFrameElement | null = null;
    private static wrapper: HTMLDivElement | null = null;
    private static backdrop: HTMLDivElement | null = null;
    private static feature: string = '';
    private static currentPath: string = '';
    private static pathCheckInterval: NodeJS.Timeout | null = null;
    private static createIFrame(url: string) {
        const iframe = document.createElement('iframe');
        iframe.title = 'Rocketfuel';
        iframe.style.display = 'none';
        iframe.style.backgroundColor = 'transparent';
        iframe.style.border = '0';
        iframe.style.overflow = 'hidden';
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
            this.feature = feature;
            this.iframe.style.width = '420px';
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
            this.feature = feature;
            this.iframe.style.width = '400px';
        }
        if (this.backdrop) {
            document.body.appendChild(this.backdrop)
        }

        this.iframe.style.display = 'block';
        this.iframe.style.height = '100%';
        this.iframe.style.border = '1px solid #dddddd';
        this.iframe.style.borderRadius = '8px';
        this.iframe.style.background = '#F8F8F8';
        if (isMobile) {
            this.iframe.style.width = '100%';
        }

        const iconUrl =
            "https://ik.imagekit.io/rocketfuel/icons/Ripple%20loading%20animation.gif";

        // Create overlay
        const overlay = document.createElement("div");
        overlay.id = "rkfl-loader-overlay";
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = '100%';
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

        // Handle iframe load events
        this.iframe.addEventListener("load", () => {
            const origin = window.location.origin;
            this.iframe?.contentWindow?.postMessage({ type: 'parent_origin', origin }, '*');
            overlay.remove();
        });

        // Listen for iframe navigation changes
        if (isMobile) {
            this.iframe.addEventListener("load", () => {
                this.checkAndAdjustHeight();
            });
            // Set up periodic checking for path changes (for SPA navigation)
            this.startPathChangeMonitoring();
            // Listen for path updates from iframe
            this.setupPathMessageListener();
        }

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
        if (isMobile) {
            this.stopPathChangeMonitoring();
            this.removePathMessageListener();
        }
        this.iframe = null;
        this.wrapper = null;
        this.currentPath = '';
    }

    public static setIframeHeight(height: string) {
        // the max height should the current screen height
        // height = 768px
        // window.innerHeight = 768px
        // height = 768px first remove px
        const convHeight = height.replace('px', '');
        if (Number(convHeight) >= Number(window.innerHeight)) {
            height = (window.innerHeight).toString() + 'px';
        }
        if (this.iframe) {
            // if the feature is not age verification 
            if (this.feature !== FEATURE_AGE_VERIFICATION.feature) {
                if (Number(height) >= Number(window.innerHeight)) {
                    height = (window.innerHeight - 20).toString();
                }
                if (Number(height) <= (Number(window.innerHeight) / 2)) {
                    height = (Number(window.innerHeight) / 2).toString();
                }
            }
            this.iframe.style.height = height;
        }
    }

    private static checkAndAdjustHeight() {
        // Check if it's just the domain (index route) without any path
        if (this.iframe && this.wrapper && this.feature === FEATURE_AGE_VERIFICATION.feature) {
            // Use the current path from iframe communication instead of src
            if (this.currentPath === '/' || this.currentPath === '') {
                // Centralize popup for index route
                this.wrapper.style.height = '500px'; // You can adjust this height as needed
                this.wrapper.style.width = '96%';
                this.wrapper.style.borderRadius = '24px';
                this.wrapper.style.margin = '2.5px';
                this.wrapper.style.position = 'fixed';
                this.wrapper.style.top = '50%';
                this.wrapper.style.left = '50%';
                this.wrapper.style.transform = 'translate(-50%, -50%)';
                this.wrapper.style.right = 'auto';
                this.wrapper.style.bottom = 'auto';
            } else {
                // Full screen for other routes
                this.wrapper.style.height = '100%';
                this.wrapper.style.width = '100%';
                this.wrapper.style.position = 'fixed';
                this.wrapper.style.top = '0';
                this.wrapper.style.left = '0';
                this.wrapper.style.right = '0';
                this.wrapper.style.bottom = '0';
                this.wrapper.style.transform = 'none';
                this.wrapper.style.borderRadius = 'unset';
                this.wrapper.style.margin = '0%';

            }
        }
    }

    private static startPathChangeMonitoring() {
        if (this.pathCheckInterval) {
            clearInterval(this.pathCheckInterval);
        }

        // Request current path from iframe
        this.requestCurrentPath();

        this.pathCheckInterval = setInterval(() => {
            if (this.iframe && this.feature === FEATURE_AGE_VERIFICATION.feature) {
                // Request current path from iframe instead of checking src
                this.requestCurrentPath();
            }
        }, 1000); // Check every 1 second
    }

    private static requestCurrentPath() {
        if (this.iframe && this.iframe.contentWindow) {
            try {
                // Send message to iframe requesting current path
                this.iframe.contentWindow.postMessage({
                    type: 'REQUEST_CURRENT_PATH'
                }, '*');
            } catch (error) {
                console.debug('Cannot communicate with iframe due to cross-origin restrictions');
            }
        }
    }

    private static stopPathChangeMonitoring() {
        if (this.pathCheckInterval) {
            clearInterval(this.pathCheckInterval);
            this.pathCheckInterval = null;
        }
    }

    private static setupPathMessageListener() {
        const handleMessage = (event: MessageEvent) => {
            // Only handle messages from our iframe
            if (event.source !== this.iframe?.contentWindow) return;

            if (event.data.type === 'CURRENT_PATH_RESPONSE') {
                const newPath = event.data.path;

                // Check if path has changed
                if (newPath !== this.currentPath) {
                    this.currentPath = newPath;
                    this.checkAndAdjustHeight();
                }
            }
        };

        window.addEventListener('message', handleMessage);

        // Store the handler so we can remove it later
        (this as any).pathMessageHandler = handleMessage;
    }

    private static removePathMessageListener() {
        if ((this as any).pathMessageHandler) {
            window.removeEventListener('message', (this as any).pathMessageHandler);
            (this as any).pathMessageHandler = null;
        }
    }
}