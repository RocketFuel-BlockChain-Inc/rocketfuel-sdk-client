import { launchAgeVerificationWidget } from './features/zkp';
import { RKFLPlugin } from './RkflPlugin';

// ✅ Attach to window directly
(window as any).RkflPlugin = RKFLPlugin;
(window as any).launchAgeVerificationWidget = launchAgeVerificationWidget;