import { FEATURE_AGE_VERIFICATION } from './constants';
import { dragElement } from './dragger';
export const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);

const ROCKETFUEL_LOADER_SVG = `<svg class="rkfl-loader-svg" width="200" height="200" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="paint0_rkfl_loader" cx="0" cy="0" r="1" gradientTransform="rotate(53.661 34.411 -57.959) scale(168.007)" gradientUnits="userSpaceOnUse">
      <stop stop-color="#B1D0FF" stop-opacity="0.8" />
      <stop offset="1" stop-color="#0088F5" />
    </radialGradient>
  </defs>
  <circle class="rkfl-loader-bg" cx="42" cy="42" r="42" fill="url(#paint0_rkfl_loader)" />

  <path
    class="rkfl-loader-fill rkfl-loader-fill-h"
    fill="#fff"
    d="M38.802 40.932H24.908V27.979h4.815l-4.313-6.116h-7.574V62.65h7.072V47.095h18.207l-4.313-6.163Z"
  />
  <path
    class="rkfl-loader-stroke rkfl-loader-stroke-h"
    pathLength="1"
    fill="none"
    stroke="#fff"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M38.802 40.932H24.908V27.979h4.815l-4.313-6.116h-7.574V62.65h7.072V47.095h18.207l-4.313-6.163Z"
  />

  <path
    class="rkfl-loader-fill rkfl-loader-fill-r"
    fill="#fff"
    d="M59.016 45.458a10.971 10.971 0 0 0 3.51-2.408 10.318 10.318 0 0 0 2.308-3.563c.566-1.53.838-3.145.802-4.767 0-3.997-1.253-7.127-3.761-9.39-2.508-2.311-6.02-3.419-10.533-3.419H29.523l4.364 6.067h15.8c5.868 0 8.777 2.215 8.777 6.694 0 2.022-.702 3.563-2.107 4.67-1.404 1.108-3.41 1.59-6.069 1.59h-7.272L58.314 62.6h7.724L54.652 46.758a20.733 20.733 0 0 0 4.364-1.3Z"
  />
  <path
    class="rkfl-loader-stroke rkfl-loader-stroke-r"
    pathLength="1"
    fill="none"
    stroke="#fff"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M59.016 45.458a10.971 10.971 0 0 0 3.51-2.408 10.318 10.318 0 0 0 2.308-3.563c.566-1.53.838-3.145.802-4.767 0-3.997-1.253-7.127-3.761-9.39-2.508-2.311-6.02-3.419-10.533-3.419H29.523l4.364 6.067h15.8c5.868 0 8.777 2.215 8.777 6.694 0 2.022-.702 3.563-2.107 4.67-1.404 1.108-3.41 1.59-6.069 1.59h-7.272L58.314 62.6h7.724L54.652 46.758a20.733 20.733 0 0 0 4.364-1.3Z"
  />
</svg>`;
export default class IframeUtiltites {
  public static iframe: HTMLIFrameElement | null = null;
  private static wrapper: HTMLDivElement | null = null;
  private static backdrop: HTMLDivElement | null = null;
  private static feature: string = '';
  private static currentPath: string = '';
  private static pathCheckInterval: NodeJS.Timeout | null = null;
  private static pathMessageHandler: ((event: MessageEvent) => void) | null = null;
  private static loaderStylesInjected = false;

  private static ensureLoaderStyles() {
    if (this.loaderStylesInjected || document.getElementById('rkfl-loader-styles')) {
      this.loaderStylesInjected = true;
      return;
    }

    const style = document.createElement('style');
    style.id = 'rkfl-loader-styles';
    style.textContent = `
      @keyframes rkflLoaderContainerPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.02); opacity: 0.96; }
      }

      @keyframes rkflLoaderBackdropPulse {
        0%, 100% { transform: scale(0.94); opacity: 0.12; }
        50% { transform: scale(1.08); opacity: 0.28; }
      }

      @keyframes rkflLoaderCircleReveal {
        0%, 10% { transform: scale(0); opacity: 0; }
        18%, 82% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }

      @keyframes rkflLoaderStrokeH {
        0%, 8% {
          stroke-dashoffset: 1;
          opacity: 0;
        }
        12% {
          opacity: 1;
        }
        45%, 100% {
          stroke-dashoffset: 0;
          opacity: 1;
        }
      }

      @keyframes rkflLoaderStrokeR {
        0%, 18% {
          stroke-dashoffset: 1;
          opacity: 0;
        }
        22% {
          opacity: 1;
        }
        62%, 100% {
          stroke-dashoffset: 0;
          opacity: 1;
        }
      }

      @keyframes rkflLoaderFillH {
        0%, 42% { opacity: 0; }
        58%, 100% { opacity: 1; }
      }

      @keyframes rkflLoaderFillR {
        0%, 58% { opacity: 0; }
        78%, 100% { opacity: 1; }
      }

      .rkfl-loader-shell {
        position: relative;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: rkflLoaderContainerPulse 3.5s ease-in-out infinite;
      }

      .rkfl-loader-shell::before {
        content: '';
        position: absolute;
        inset: 14px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 136, 245, 0.24) 0%, rgba(0, 136, 245, 0.08) 45%, rgba(0, 136, 245, 0) 74%);
        filter: blur(4px);
        animation: rkflLoaderBackdropPulse 3.5s ease-in-out infinite;
      }

      .rkfl-loader-svg {
        position: relative;
        z-index: 1;
        width: 80px;
        height: 80px;
        overflow: visible;
        filter: drop-shadow(0 6px 12px rgba(0, 136, 245, 0.18));
      }

      .rkfl-loader-bg {
        transform-origin: 42px 42px;
        animation: rkflLoaderCircleReveal 3.5s ease-in-out infinite;
      }

      .rkfl-loader-stroke {
        stroke-dasharray: 1;
        stroke-dashoffset: 1;
        fill: none;
        opacity: 0;
      }

      .rkfl-loader-stroke-h {
        animation: rkflLoaderStrokeH 3.5s ease-in-out infinite;
      }

      .rkfl-loader-stroke-r {
        animation: rkflLoaderStrokeR 3.5s ease-in-out infinite;
      }

      .rkfl-loader-fill {
        opacity: 0;
      }

      .rkfl-loader-fill-h {
        animation: rkflLoaderFillH 3.5s ease-in-out infinite;
      }

      .rkfl-loader-fill-r {
        animation: rkflLoaderFillR 3.5s ease-in-out infinite;
      }
    `;

    document.head.appendChild(style);
    this.loaderStylesInjected = true;
  }

  private static createLoaderElement() {
    this.ensureLoaderStyles();

    const loaderShell = document.createElement('div');
    loaderShell.className = 'rkfl-loader-shell';
    loaderShell.innerHTML = ROCKETFUEL_LOADER_SVG;

    return loaderShell;
  }

  private static createIFrame(url: string) {
    const iframe = document.createElement('iframe');
    iframe.title = 'Rocketfuel';
    iframe.style.display = 'none';
    iframe.style.backgroundColor = 'transparent';
    iframe.style.border = '0';
    iframe.style.overflow = 'hidden';
    iframe.style.overflowY = 'auto';
    iframe.style.minHeight = '500px';
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
        document.body.appendChild(this.backdrop);
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

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'rkfl-loader-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.border = '1px solid #dddddd';
    overlay.style.borderRadius = '8px';
    overlay.style.backgroundColor = '#F8F8F8';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9998';

    const loader = this.createLoaderElement();

    // Handle iframe load events
    this.iframe.addEventListener('load', () => {
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
      this.iframe.addEventListener('load', () => {
        this.checkAndAdjustHeight();
      });
      // Set up periodic checking for path changes (for SPA navigation)
      this.startPathChangeMonitoring();
      // Listen for path updates from iframe
      this.setupPathMessageListener();
    }

    if (this.backdrop) {
      document.body.appendChild(this.backdrop);
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
      height = window.innerHeight.toString() + 'px';
    }
    if (this.iframe) {
      // if the feature is not age verification
      if (this.feature !== FEATURE_AGE_VERIFICATION.feature) {
        if (Number(height) >= Number(window.innerHeight)) {
          height = (window.innerHeight - 20).toString();
        }
        if (Number(height) <= Number(window.innerHeight) / 2) {
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
        this.iframe.contentWindow.postMessage(
          {
            type: 'REQUEST_CURRENT_PATH',
          },
          '*'
        );
      } catch (_error) {
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
      } catch (err) {
        console.error('Error in message handler:', err);
        this.handleCrash('message_handler', err);
      }
    };

    try {
      window.addEventListener('message', handleMessage);
      IframeUtiltites.pathMessageHandler = handleMessage;
    } catch (err) {
      console.error('Error setting up message listener:', err);
      this.handleCrash('message_listener_setup', err);
    }
  }

  private static removePathMessageListener() {
    if (IframeUtiltites.pathMessageHandler) {
      window.removeEventListener('message', IframeUtiltites.pathMessageHandler);
      IframeUtiltites.pathMessageHandler = null;
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
    } catch (_error) {
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
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        });
      }

      // Clear localStorage and sessionStorage for iframe-related data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes('rocketfuel') || key.includes('age-verification') || key.includes('zkp'))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (
          key &&
          (key.includes('rocketfuel') || key.includes('age-verification') || key.includes('zkp'))
        ) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));

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
        caches.keys().then((cacheNames) => {
          // Only clear caches that might contain iframe content
          const iframeRelatedCaches = cacheNames.filter(
            (name) =>
              name.includes('iframe') ||
              name.includes('age-verification') ||
              name.includes('zkp') ||
              name.includes('rocketfuel')
          );

          iframeRelatedCaches.forEach((cacheName) => {
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
        caches.keys().then((cacheNames) => {
          const essentialCaches = cacheNames.filter(
            (name) => name.includes('rocketfuel') || name.includes('age-verification')
          );

          essentialCaches.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        });
      }

      // Clear only essential storage
      const essentialKeys = ['access', 'rocketfuel_token', 'age_verification_data'];
      essentialKeys.forEach((key) => {
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
    } catch (_error) {
      const separator = url.includes('?') ? '&' : '?';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      return `${url}${separator}_nocache=1&_t=${timestamp}&_r=${random}&_html=1&_css=1&_js=1&_img=1&_force=1`;
    }
  }

  // Crash handling and recovery methods
  private static handleCrash(context: string, error: unknown): void {
    try {
      console.error(`Crash in ${context}:`, error);

      // Log crash details for debugging
      const crashInfo = {
        context,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Store crash info for debugging (optional)
      try {
        sessionStorage.setItem('rkfl_crash_info', JSON.stringify(crashInfo));
      } catch (_e) {
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

  private static attemptRecovery(context: string, _error: unknown): void {
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

        case 'iframe_load_handler': {
          // Remove overlay manually
          const overlay = document.getElementById('rkfl-loader-overlay');
          if (overlay) {
            overlay.remove();
          }
          break;
        }

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
