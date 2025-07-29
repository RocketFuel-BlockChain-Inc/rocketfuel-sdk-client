import { placeOrder } from './features/payin';
import { FEATURE_AGE_VERIFICATION, FEATURE_PAYIN } from './utils/constants';

interface SDKConfig {
  clientId: string;
  clientSecret: string;
  buttons: string[];
  containerId: string;
  redirect: boolean;
  merchantId: string;
  enviornment: string;
}

class RKFLPlugin {
  private clientId: string;
  private clientSecret: string;
  private buttons: string[];
  private containerId: string;
  private redirect: boolean = false;
  private merchantId: string;
  private cartData: any;
  private payNowButton: HTMLButtonElement | null = null;
  private enviornment: string;
  constructor(config: SDKConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.merchantId = config.merchantId;
    this.buttons = config.buttons || [];
    this.containerId = config.containerId;
    this.redirect = config.redirect || false;
    this.enviornment = config.enviornment || 'prod'
  }

  public init(): void {
    if (!this.clientId || !this.clientSecret || !this.merchantId) {
      console.error('Client ID, Client Secret, and Merchant Id are required');
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
          button.disabled = true; // Initially disabled
          this.payNowButton = button;
          button.onclick = async () => {
            if (!this.cartData) {
              console.warn('Cart data is not prepared');
              return;
            }
            this.setLoadingState(true);
            try {
              await placeOrder(
                this.clientId,
                this.clientSecret,
                this.merchantId,
                this.redirect,
                this.cartData,
                this.enviornment
              );
            } catch (err) {
              console.error('Error during order placement:', err);
            } finally {
              this.setLoadingState(false);
            }
          };
          break;

        case FEATURE_AGE_VERIFICATION:
          button.innerText = 'Verify Age';
          button.onclick = () =>
            alert(`Age verification started for ${this.clientId}`);
          break;

        default:
          console.warn(`Unknown button: ${btnType}`);
          return;
      }

      container.appendChild(button);
    });
  }

  public prepareOrder(cartData: any): void {
    this.cartData = cartData;
    if (this.payNowButton) {
      this.payNowButton.disabled = false;
    }
  }

  private setLoadingState(isLoading: boolean): void {
    if (!this.payNowButton) return;

    if (isLoading) {
      this.payNowButton.disabled = true;
      this.payNowButton.innerText = 'Processing...';
    } else {
      this.payNowButton.disabled = false;
      this.payNowButton.innerText = 'Pay Now';
    }
  }
}

// ✅ Makes available globally
(window as any).RkflPlugin = RKFLPlugin;
