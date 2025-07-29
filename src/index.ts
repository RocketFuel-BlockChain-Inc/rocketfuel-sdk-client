import { placeOrder } from './features/payin';
import { FEATURE_AGE_VERIFICATION, FEATURE_PAYIN } from './utils/constants';

interface SDKConfig {
  clientId: string;
  clientSecret: string;
  buttons: string[];
  containerId: string;
  redirect: Boolean;
  merchantId: string;
}

class RKFLPlugin {
  private clientId: string;
  private clientSecret: string;
  private buttons: string[];
  private containerId: string;
  private redirect: Boolean = false;
  private merchantId: string;
  constructor(config: SDKConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.merchantId = config.merchantId;
    this.buttons = config.buttons || [];
    this.containerId = config.containerId;
    this.redirect == config.redirect || false;
  }

  public init(): void {
    if (!this.clientId || !this.clientSecret || !this.merchantId) {
      console.error('Client ID, Client Secret and Merchant Id are required');
      return;
    }

    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with ID "${this.containerId}" not found.`);
      return;
    }

    this.buttons.forEach((btnType) => {
      const button = document.createElement('button');
      button.style.margin = '5px';
      button.style.padding = '10px 20px';

      switch (btnType) {
        case FEATURE_PAYIN:
          button.innerText = 'Pay Now';
          button.onclick = () => placeOrder(this.clientId, this.clientSecret, this.merchantId, this.redirect);
          break;
        case FEATURE_AGE_VERIFICATION:
          button.innerText = 'Verify Age';
          button.onclick = () => alert(`Age verification started for ${this.clientId}`);
          break;
        default:
          console.warn(`Unknown button: ${btnType}`);
          return;
      }

      container.appendChild(button);
    });
  }
}

// ✅ This makes the class available globally when loaded via <script>
(window as any).RkflPlugin = RKFLPlugin;
