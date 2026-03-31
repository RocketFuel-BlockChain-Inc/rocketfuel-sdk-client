import type { IIframeService } from '../core/IIframeService';
import IframeUtilities from './IframeUtilities';

/**
 * Default iframe service implementation (wraps static IframeUtilities).
 * Enables dependency injection and loose coupling.
 */
export function getDefaultIframeService(): IIframeService {
  return {
    get iframe() {
      return IframeUtilities.iframe;
    },
    showOverlay: (url: string, feature: string) => IframeUtilities.showOverlay(url, feature),
    closeIframe: () => IframeUtilities.closeIframe(),
    setIframeHeight: (height: string) => IframeUtilities.setIframeHeight(height),
  };
}
