// ✅ Makes available globally

import { RKFLPlugin, SDKConfig } from "./RkflPlugin";


(window as any).RkflPlugin = RKFLPlugin;

// ✅ Optionally export types for SDK users
export type { SDKConfig };