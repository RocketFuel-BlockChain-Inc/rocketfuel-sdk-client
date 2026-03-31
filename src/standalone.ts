import { RKFLPlugin } from './RkflPlugin';

declare global {
  interface Window {
    RkflPlugin: typeof RKFLPlugin;
  }
}
window.RkflPlugin = RKFLPlugin;
