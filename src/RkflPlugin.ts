import { placeOrder } from './features/payin';
import { initializeWidget, launchAgeVerificationWidget } from './features/zkp';
import { UserInfo } from './features/zkp/types';
import ApiClient from './utils/client';
import { appEnv, ContainerId, EVENTS, FEATURE_AGE_VERIFICATION, FEATURE_PAYIN } from './utils/constants';
import IframeUtiltites from './utils/IframeUtilities';
import { verifier } from './utils/verifier';
interface Buttons {
  feature: "PAYIN" | "AGE_VERIFICATION"; // Add other valid features
  style?: string;
  containerStyle?: string;
  containerId?: string;
  inject?: boolean,
  countries?: string[]
}
export interface SDKConfig {
  clientId: string;
  environment: "production" | "qa" | "preprod" | "sandbox";
  redirect?: boolean;
  plugins: Buttons[];
}
export class RKFLPlugin {
  private clientId: string;
  private buttons: Buttons[];
  private redirect: boolean = false;
  private uuid: string;
  private payNowButton: HTMLButtonElement | null = null;
  private userInfo: UserInfo;
  private enviornment: "production" | "qa" | "preprod" | "sandbox";
  private innerHtmlPay: string = '<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Pay with Crypto Currency';
  private innerHtmlVerify: string = `<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Verification via Rocketfuel`;
  private innerHtmlPayLoading: string = `<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Processing...`;
  constructor(config: SDKConfig) {
    const env = config.environment;
    if (
      appEnv === 'production' &&
      (env && !(['production', 'sandbox'].includes(env)))
    ) {
      throw new Error(`Invalid environment "${env}" in production mode.`);
    }
    this.clientId = config.clientId;
    this.buttons = config.plugins.length === 0 ? [FEATURE_PAYIN] : config.plugins;
    this.redirect = config.redirect || false;
    this.enviornment = config.environment || 'production'
    this.uuid = '';
    this.userInfo = { email: "", userId: "" };
  }

  public async init(): Promise<Boolean | void> {
    // to-do clientid verification

    if (!this.clientId) {
      console.error('Client ID is required');
      return false;
    }
    const client = new ApiClient(this.enviornment);
    try {
      const data = await client.verifyClient(this.clientId);
      if (data.ok) {
        //success
        // return true;
      } else {
        console.error('Client Id verificaiton failed', data.error)
        return false;
      }
    } catch (err) {
      console.error('Client ID verificaiton failed', err);

      return true;
    }

    // verify client id


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
          if(typeof btnType.inject === 'boolean' && !btnType.inject) {
            return;
          }
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
          if (!document.getElementById('#pay')) {
            container.appendChild(button);
          }
          break;

        case FEATURE_AGE_VERIFICATION.feature:
          button.innerHTML = this.innerHtmlVerify;
          button.onclick = () => launchAgeVerificationWidget(this.userInfo);
          button.id = '#age'
          const container2 = document.getElementById(btnType.containerId || ContainerId);
          if (!container2 && btnType.inject) {
            console.error(`Container not found.`);
            return;
          }
          initializeWidget(this.clientId, this.enviornment, this.redirect);
          if (btnType.inject === undefined || btnType.inject === null || btnType.inject) {
            if (container2 && !document.getElementById('#age')) {
              container2.appendChild(button);
            }
          }
          break;

        default:
          console.warn(`Unknown button: ${btnType}`);
          return;
      }

    });
    // modal listner
    window.addEventListener("message", this.handleMessage.bind(this));

  }
  public setUserInfo(userInfo: UserInfo): void {
    this.userInfo = userInfo;
  }
  public prepareOrder(uuid: any): void {
    if (this.payNowButton) {
      this.uuid = uuid;

      if (uuid) {
        this.payNowButton.disabled = false;
        this.payNowButton.style.opacity = '1';
      } else {
        this.payNowButton.disabled = false;
        this.payNowButton.style.opacity = '0.4';
      }
    }
  }
  private handleMessage(event: MessageEvent) {
    const data = event.data;
    if (data.type === EVENTS.CLOSE_MODAL) {
      IframeUtiltites.closeIframe();
    }
    if (data.type === 'initialize_widget') {
      const access = localStorage.getItem('access');
     
      const data = {
        access,
        clientId: this.clientId,
        userInfo: this.userInfo,
        countries: this.buttons.map((btn) => btn.countries).filter((country) => country !== undefined)[0]
      }
      if (IframeUtiltites?.iframe?.contentWindow && access) {
        IframeUtiltites.iframe.contentWindow.postMessage(
          {
            type: 'initialize_widget',
            data
          },
          '*'
        );
      }
    }
    if (data.type === 'rocketfuel_change_height') {
      IframeUtiltites.setIframeHeight(data.data)
      IframeUtiltites.iframe?.contentWindow?.postMessage({
        type: 'rocketfuel_return_width',
        data: window.outerWidth
      }, '*');
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
  public launchAgeVerificationWidget(): void {
    launchAgeVerificationWidget(this.userInfo);
  }
  public async launchPaymentWidget(uuid: string): Promise<void> {
    if (IframeUtiltites.iframe) {
      return;
    }
    if (!uuid) {
      console.warn('Cart data is not prepared');
      return;
    }

    try {
      await placeOrder(
        this.clientId,
        this.redirect,
        uuid,
        this.enviornment
      );
    } catch (err) {
      console.error('Error during order placement:', err);
    }
  }
  public async verifyAgeVerification(auditId: string): Promise<any> {
    return verifier(auditId, this.enviornment);
  }
}

