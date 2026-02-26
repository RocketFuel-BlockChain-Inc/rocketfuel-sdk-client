/**
 * Abstraction for iframe overlay behavior. Allows loose coupling and testing.
 */
export interface IIframeService {
    readonly iframe: HTMLIFrameElement | null;
    showOverlay(url: string, feature: string): void;
    closeIframe(): void;
    setIframeHeight(height: string): void;
}
