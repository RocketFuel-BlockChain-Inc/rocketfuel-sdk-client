export declare const isMobile: boolean;
export default class IframeUtiltites {
    static iframe: HTMLIFrameElement | null;
    private static wrapper;
    private static backdrop;
    private static feature;
    private static currentPath;
    private static pathCheckInterval;
    private static createIFrame;
    static showOverlay(url: string, feature: string): void;
    static closeIframe(): void;
    static setIframeHeight(height: string): void;
    private static checkAndAdjustHeight;
    private static startPathChangeMonitoring;
    private static requestCurrentPath;
    private static stopPathChangeMonitoring;
    private static setupPathMessageListener;
    private static removePathMessageListener;
}
