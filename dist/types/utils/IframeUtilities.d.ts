export default class IframeUtiltites {
    static iframe: HTMLIFrameElement | null;
    private static wrapper;
    private static backdrop;
    private static createIFrame;
    static showOverlay(url: string, feature: string): void;
    static closeIframe(): void;
    static setIframeHeight(height: string): void;
}
