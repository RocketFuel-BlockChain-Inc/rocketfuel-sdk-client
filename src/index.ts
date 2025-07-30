import { placeOrder } from './features/payin';
import { initializeWidget, launchWidget } from './features/zkp';
import { FEATURE_AGE_VERIFICATION, FEATURE_PAYIN } from './utils/constants';

interface SDKConfig {
  clientId: string;
  clientSecret: string;
  buttons: string[];
  containerId: string;
  redirect: boolean;
  merchantId: string;
  enviornment: "prod" | "qa" | "preprod" | "sandbox";
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
  private enviornment: "prod" | "qa" | "preprod" | "sandbox";
  constructor(config: SDKConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.merchantId = config.merchantId;
    this.buttons = config.buttons.length === 0 ? [FEATURE_PAYIN] : config.buttons;
    this.containerId = config.containerId;
    this.redirect = config.redirect || false;
    this.enviornment = config.enviornment || 'prod'
  }

  public init(): void {
    if (this.buttons.includes(FEATURE_PAYIN)) {
      if (!this.clientId || !this.clientSecret || !this.merchantId) {
        console.error('Client ID, Client Secret, and Merchant Id are required');
        return;
      }
    } else {
      if (!this.clientId) {
        console.error('Client ID is required');
        return;
      }
    }


    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with ID "${this.containerId}" not found.`);
      return;
    }

    this.buttons.forEach((btnType) => {
      const button = document.createElement('button');
      button.style.minWidth = '250px';
      button.style.margin = '5px';
      button.style.padding = '8px 16px';
      button.style.border = '1px solid #e0e0e0';
      button.style.borderRadius = '999px'; // fully rounded pill shape
      button.style.backgroundColor = 'white';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.gap = '8px';
      button.style.fontFamily = 'sans-serif';
      button.style.fontSize = '14px';
      button.style.color = '#1a1a1a';
      button.style.cursor = 'pointer';
      button.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.05)';

      switch (btnType) {
        case FEATURE_PAYIN:
          button.innerHTML = `<img src="https://ik.imagekit.io/rocketfuel/icons/button-image.png?tr=w-30,h-30,fo-auto,q-50" alt=""> Pay with Cryto Currency`;
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
          button.innerHTML = `<img src="https://ik.imagekit.io/rocketfuel/icons/button-image.png?tr=w-30,h-30,fo-auto,q-50" alt=""> Verification via Rocketfuel`;
          button.onclick = () => this.ageVerification(this.enviornment);
          initializeWidget(this.clientId, this.enviornment);
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
    console.log('this.cartdata', cartData)
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
  private ageVerification(env: any): void {
    console.log(env);
    launchWidget();
  }
}

// ✅ Makes available globally
(window as any).RkflPlugin = RKFLPlugin;
