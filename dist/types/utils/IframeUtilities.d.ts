export default class IframeUtiltites {
    static iframe: HTMLIFrameElement | null;
    private static wrapper;
    private static createIFrame;
    static showOverlay(url: string, showCross?: boolean): void;
    static closeIframe(): void;
}
