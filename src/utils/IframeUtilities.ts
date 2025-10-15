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
        
        // Add cache-busting parameter to ensure fresh content
        const cacheBustedUrl = this.addCacheBusting(url);
        iframe.src = cacheBustedUrl;
        
        return iframe;
    }
    public static showOverlay(url: string, feature: string) {
        try {
            if (this.iframe) {
                // Add cache-busting when updating iframe src
                const cacheBustedUrl = this.addCacheBusting(url);
                this.iframe.src = cacheBustedUrl;
                return;
            }
            // Create iframe and wrapper
            this.iframe = this.createIFrame(url);
            const wrapper = dragElement(feature);
            this.wrapper = wrapper;
        } catch (error) {
            console.error('Error in showOverlay:', error);
            this.handleCrash('showOverlay', error);
            return;
        }

        // add backdrop
        try {
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
        } catch (error) {
            console.error('Error creating backdrop:', error);
            this.handleCrash('backdrop_creation', error);
        }

        try {
            this.iframe.style.display = 'block';
            this.iframe.style.height = '100%';
            this.iframe.style.border = '1px solid #dddddd';
            this.iframe.style.borderRadius = '8px';
            this.iframe.style.background = '#F8F8F8';
            if (isMobile) {
                this.iframe.style.width = '100%';
            }
        } catch (error) {
            console.error('Error styling iframe:', error);
            this.handleCrash('iframe_styling', error);
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
            try {
                const origin = window.location.origin;
                this.iframe?.contentWindow?.postMessage({ type: 'parent_origin', origin }, '*');
                overlay.remove();
            } catch (error) {
                console.error('Error in iframe load handler:', error);
                this.handleCrash('iframe_load_handler', error);
            }
        });

        // Clear caches asynchronously to avoid blocking iframe loading
        setTimeout(() => {
            this.clearBrowserCaches();
        }, 0);

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
        this.wrapper.appendChild(this.iframe);
        this.wrapper.appendChild(overlay);
        document.body.appendChild(this.wrapper);
    }

    public static closeIframe() {
        try {
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
        } catch (error) {
            console.error('Error closing iframe:', error);
            this.handleCrash('close_iframe', error);
            // Force cleanup even if there's an error
            this.forceCleanup();
        }
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
            try {
                // Only handle messages from our iframe
                if (event.source !== this.iframe?.contentWindow) return;

                if (event.data && event.data.type === 'CURRENT_PATH_RESPONSE') {
                    const newPath = event.data.path;

                    // Check if path has changed
                    if (newPath !== this.currentPath) {
                        this.currentPath = newPath;
                        this.checkAndAdjustHeight();
                    }
                }
            } catch (error) {
                console.error('Error in message handler:', error);
                this.handleCrash('message_handler', error);
            }
        };

        try {
            window.addEventListener('message', handleMessage);
            // Store the handler so we can remove it later
            (this as any).pathMessageHandler = handleMessage;
        } catch (error) {
            console.error('Error setting up message listener:', error);
            this.handleCrash('message_listener_setup', error);
        }
    }

    private static removePathMessageListener() {
        if ((this as any).pathMessageHandler) {
            window.removeEventListener('message', (this as any).pathMessageHandler);
            (this as any).pathMessageHandler = null;
        }
    }

    private static addCacheBusting(url: string): string {
        try {
            const urlObj = new URL(url);
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            
            // Add multiple cache-busting parameters
            urlObj.searchParams.set('_t', timestamp.toString());
            urlObj.searchParams.set('_r', random);
            urlObj.searchParams.set('_cb', '1'); // cache-bust flag
            urlObj.searchParams.set('_v', '1.1.0'); // version
            
            return urlObj.toString();
        } catch (error) {
            // If URL parsing fails, append cache-busting parameters manually
            const separator = url.includes('?') ? '&' : '?';
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            return `${url}${separator}_t=${timestamp}&_r=${random}&_cb=1&_v=1.1.0`;
        }
    }

    private static clearBrowserCaches(): void {
        try {
            // Clear various types of caches
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    cacheNames.forEach(cacheName => {
                        caches.delete(cacheName);
                    });
                });
            }

            // Clear localStorage and sessionStorage for iframe-related data
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('rocketfuel') || key.includes('age-verification') || key.includes('zkp'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            // Clear sessionStorage
            const sessionKeysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && (key.includes('rocketfuel') || key.includes('age-verification') || key.includes('zkp'))) {
                    sessionKeysToRemove.push(key);
                }
            }
            sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

            // Clear HTML and CSS specific caches
            this.clearHTMLAndCSSCaches();

        } catch (error) {
            console.warn('Could not clear all browser caches:', error);
        }
    }

    private static clearHTMLAndCSSCaches(): void {
        try {
            // Use a more efficient approach - only clear iframe-specific caches
            // and avoid making multiple network requests that could impact performance
            
            // Clear only relevant caches without making additional requests
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    // Only clear caches that might contain iframe content
                    const iframeRelatedCaches = cacheNames.filter(name => 
                        name.includes('iframe') || 
                        name.includes('age-verification') || 
                        name.includes('zkp') ||
                        name.includes('rocketfuel')
                    );
                    
                    iframeRelatedCaches.forEach(cacheName => {
                        caches.delete(cacheName);
                    });
                });
            }

        } catch (error) {
            console.warn('Could not clear HTML/CSS caches:', error);
        }
    }

    private static forceIframeReload(): void {
        if (this.iframe) {
            // Force iframe to reload with cache-busting
            const currentSrc = this.iframe.src;
            const cacheBustedSrc = this.addCacheBusting(currentSrc);
            
            // Temporarily hide iframe during reload
            this.iframe.style.display = 'none';
            
            // Clear caches before reload
            this.clearBrowserCaches();
            
            // Reload with cache-busted URL
            this.iframe.src = cacheBustedSrc;
            
            // Show iframe after a short delay
            setTimeout(() => {
                if (this.iframe) {
                    this.iframe.style.display = 'block';
                }
            }, 100);
        }
    }

    // Public method to force clear all caches and reload iframe
    public static clearCacheAndReload(): void {
        this.clearBrowserCaches();
        this.forceIframeReload();
    }

    // Public method to just clear caches without reloading
    public static clearCaches(): void {
        this.clearBrowserCaches();
    }

    // Public method to specifically clear HTML and CSS caches
    public static clearHTMLAndCSSCachesPublic(): void {
        this.clearHTMLAndCSSCaches();
    }

    // Public method to force iframe to load with no-cache headers
    public static forceNoCacheLoad(url: string): void {
        if (this.iframe) {
            // Add no-cache headers and parameters
            const noCacheUrl = this.addNoCacheHeaders(url);
            this.iframe.src = noCacheUrl;
        }
    }

    // Lightweight cache clearing with minimal performance impact
    public static lightCacheClear(): void {
        try {
            // Only clear the most essential caches without blocking operations
            if ('caches' in window) {
                // Clear caches asynchronously without blocking
                caches.keys().then(cacheNames => {
                    const essentialCaches = cacheNames.filter(name => 
                        name.includes('rocketfuel') || 
                        name.includes('age-verification')
                    );
                    
                    essentialCaches.forEach(cacheName => {
                        caches.delete(cacheName);
                    });
                });
            }
            
            // Clear only essential storage
            const essentialKeys = ['access', 'rocketfuel_token', 'age_verification_data'];
            essentialKeys.forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });
            
        } catch (error) {
            console.warn('Light cache clear failed:', error);
        }
    }

    private static addNoCacheHeaders(url: string): string {
        try {
            const urlObj = new URL(url);
            
            // Add aggressive no-cache parameters
            urlObj.searchParams.set('_nocache', '1');
            urlObj.searchParams.set('_t', Date.now().toString());
            urlObj.searchParams.set('_r', Math.random().toString(36).substring(7));
            urlObj.searchParams.set('_html', '1');
            urlObj.searchParams.set('_css', '1');
            urlObj.searchParams.set('_js', '1');
            urlObj.searchParams.set('_img', '1');
            urlObj.searchParams.set('_force', '1');
            
            return urlObj.toString();
        } catch (error) {
            const separator = url.includes('?') ? '&' : '?';
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            return `${url}${separator}_nocache=1&_t=${timestamp}&_r=${random}&_html=1&_css=1&_js=1&_img=1&_force=1`;
        }
    }

    // Crash handling and recovery methods
    private static handleCrash(context: string, error: any): void {
        try {
            console.error(`Crash in ${context}:`, error);
            
            // Log crash details for debugging
            const crashInfo = {
                context,
                error: error?.message || error,
                stack: error?.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // Store crash info for debugging (optional)
            try {
                sessionStorage.setItem('rkfl_crash_info', JSON.stringify(crashInfo));
            } catch (e) {
                // Ignore storage errors
            }
            
            // Attempt recovery based on context
            this.attemptRecovery(context, error);
            
        } catch (recoveryError) {
            console.error('Error in crash handler:', recoveryError);
            // Last resort - force cleanup
            this.forceCleanup();
        }
    }

    private static attemptRecovery(context: string, error: any): void {
        try {
            switch (context) {
                case 'showOverlay':
                    // Try to clean up and retry
                    this.forceCleanup();
                    break;
                    
                case 'backdrop_creation':
                    // Continue without backdrop
                    console.warn('Continuing without backdrop due to error');
                    break;
                    
                case 'iframe_styling':
                    // Try basic styling
                    if (this.iframe) {
                        this.iframe.style.display = 'block';
                    }
                    break;
                    
                case 'iframe_load_handler':
                    // Remove overlay manually
                    const overlay = document.getElementById('rkfl-loader-overlay');
                    if (overlay) {
                        overlay.remove();
                    }
                    break;
                    
                case 'close_iframe':
                    // Force cleanup
                    this.forceCleanup();
                    break;
                    
                default:
                    // Generic recovery
                    this.forceCleanup();
            }
        } catch (recoveryError) {
            console.error('Recovery failed:', recoveryError);
            this.forceCleanup();
        }
    }

    private static forceCleanup(): void {
        try {
            // Force remove all elements
            const wrapper = document.querySelector('[data-rkfl-wrapper]') || this.wrapper;
            if (wrapper && wrapper.parentNode) {
                wrapper.parentNode.removeChild(wrapper);
            }
            
            const backdrop = document.getElementById('backdrop-age-verification');
            if (backdrop && backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
            }
            
            const overlay = document.getElementById('rkfl-loader-overlay');
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            
            // Clear intervals and listeners
            this.stopPathChangeMonitoring();
            this.removePathMessageListener();
            
            // Reset state
            this.iframe = null;
            this.wrapper = null;
            this.backdrop = null;
            this.currentPath = '';
            this.feature = '';
            
        } catch (error) {
            console.error('Force cleanup failed:', error);
        }
    }

    // Public method to check if iframe is in a healthy state
    public static isHealthy(): boolean {
        try {
            return !!(this.iframe && this.wrapper && !this.iframe.src.includes('error'));
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }

    // Public method to recover from crashes
    public static recover(): void {
        try {
            this.forceCleanup();
        } catch (error) {
            console.error('Recovery failed:', error);
        }
    }
}