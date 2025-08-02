import { placeOrder } from './features/payin';
import { initializeWidget, launchAgeVerificationWidget } from './features/zkp';
import { appEnv, ContainerId, EVENTS, FEATURE_AGE_VERIFICATION, FEATURE_PAYIN } from './utils/constants';
import IframeUtiltites from './utils/IframeUtilities';
interface Buttons {
  feature: "PAYIN" | "AGE_VERIFICATION"; // Add other valid features
  style?: string;
  containerStyle?: string;
  containerId?: string;
  inject?: boolean
}
export interface SDKConfig {
  clientId: string;
  environment: "prod" | "qa" | "preprod" | "sandbox";
  redirect?: boolean;
  plugins: Buttons[];
}
export class RKFLPlugin {
  private clientId: string;
  private buttons: Buttons[];
  private redirect: boolean = false;
  private uuid: string;
  private payNowButton: HTMLButtonElement | null = null;
  private enviornment: "prod" | "qa" | "preprod" | "sandbox";
  private innerHtmlPay: string = '<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Pay with Cryto Currency';
  private innerHtmlVerify: string = `<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Verification via Rocketfuel`;
  private innerHtmlPayLoading: string = `<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Processing...`;
  constructor(config: SDKConfig) {
    const env = config.environment;
    if (
      appEnv === 'production' &&
      (env && !(['prod', 'sandbox'].includes(env)))
    ) {
      throw new Error(`Invalid environment "${env}" in production mode.`);
    }
    this.clientId = config.clientId;
    this.buttons = config.plugins.length === 0 ? [FEATURE_PAYIN] : config.plugins;
    this.redirect = config.redirect || false;
    this.enviornment = config.environment || 'prod'
    this.uuid = '';
  }

  public init(): void {
    const isPayinEnabled = this.buttons.find(v => v.feature === FEATURE_PAYIN.feature)
    // to-do clientid verification
    if (isPayinEnabled) {
      if (!this.clientId) {
        console.error('Client ID is required');
        return;
      }
    } else {
      if (!this.clientId) {
        console.error('Client ID is required');
        return;
      }
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

      switch (btnType.feature) {
        case FEATURE_PAYIN.feature:
          button.innerHTML = this.innerHtmlPay;
          button.disabled = true; // Initially disabled
          button.style.opacity = '0.4';
          this.payNowButton = button;
          button.id = '#pay'
          const container = document.getElementById(btnType.containerId || ContainerId);
          if (!container) {
            console.error(`Container not found.`);
            return;
          }
          button.onclick = async () => {
            if (IframeUtiltites.iframe) {
              return;
            }
            if (!this.uuid) {
              console.warn('Cart data is not prepared');
              return;
            }

            this.setLoadingState(true);
            try {
              await placeOrder(
                this.clientId,
                this.redirect,
                this.uuid,
                this.enviornment
              );
            } catch (err) {
              console.error('Error during order placement:', err);
            } finally {
              this.setLoadingState(false);
            }
          };
          container.appendChild(button);
          break;

        case FEATURE_AGE_VERIFICATION.feature:
          button.innerHTML = this.innerHtmlVerify;
          button.onclick = () => this.ageVerification(this.enviornment);
          button.id = '#age'
          const container2 = document.getElementById(btnType.containerId || ContainerId);
          if (!container2) {
            console.error(`Container not found.`);
            return;
          }
          initializeWidget(this.clientId, this.enviornment, this.redirect);
          if (btnType.inject === undefined || btnType.inject === null || btnType.inject) {
            container2.appendChild(button);
          }
          break;

        default:
          console.warn(`Unknown button: ${btnType}`);
          return;
      }

    });
    // modal listner
    window.addEventListener("message", this.handleMessage);

  }

  public prepareOrder(uuid: any): void {
    this.uuid = uuid;
    if (this.payNowButton) {
      this.payNowButton.disabled = false;
      this.payNowButton.style.opacity = '1';
    }
  }
  private handleMessage(event: MessageEvent) {
    const data = event.data;
    if (data.type === EVENTS.CLOSE_MODAL) {
      IframeUtiltites.closeIframe();
    }
  }

  private setLoadingState(isLoading: boolean): void {
    if (!this.payNowButton) return;

    if (isLoading) {
      this.payNowButton.disabled = true;
      this.payNowButton.innerHTML = this.innerHtmlPayLoading;
    } else {
      this.payNowButton.disabled = false;
      this.payNowButton.innerHTML = this.innerHtmlPay;
    }
  }
  private ageVerification(env: any): void {
    launchAgeVerificationWidget();
  }
}

