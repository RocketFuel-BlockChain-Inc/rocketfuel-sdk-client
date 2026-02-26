import type { IIframeService } from './core/IIframeService';
import type { ButtonConfig, SDKConfig, UserInfo } from './core/types';
import { getDefaultIframeService } from './utils/iframeServiceAdapter';
import ApiClient from './utils/client';
import {
  appEnv,
  ContainerId,
  EVENTS,
  FEATURE_AGE_VERIFICATION,
  FEATURE_PAYIN,
} from './utils/constants';
import { verifier } from './utils/verifier';

export type { SDKConfig, UserInfo } from './core/types';

export class RKFLPlugin {
  private clientId: string;
  private buttons: ButtonConfig[];
  private redirect = false;
  private uuid: string;
  private payNowButton: HTMLButtonElement | null = null;
  private userInfo: UserInfo;
  private environment: SDKConfig['environment'];
  private iframeService: IIframeService;
  private zkpInitialized = false;

  private readonly innerHtmlPay =
    '<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Pay with Crypto Currency';
  private readonly innerHtmlVerify = `<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Verification via Rocketfuel`;
  private readonly innerHtmlPayLoading = `<img src="https://ik.imagekit.io/rocketfuel/icons/rocketfuel-circular.svg?tr=w-30,h-30,fo-auto,q-50" alt="" style="width: 30px; height:30px;"> Processing...`;

  constructor(config: SDKConfig, iframeService?: IIframeService) {
    const env = config.environment;
    if (appEnv === 'production' && env && !['production', 'sandbox'].includes(env)) {
      throw new Error(`Invalid environment "${env}" in production mode.`);
    }
    this.clientId = config.clientId;
    this.buttons = config.plugins.length === 0 ? [FEATURE_PAYIN as ButtonConfig] : config.plugins;
    this.redirect = config.redirect ?? false;
    this.environment = config.environment ?? 'production';
    this.uuid = '';
    this.userInfo = { email: '', userId: '' };
    this.iframeService = iframeService ?? getDefaultIframeService();
  }

  public async init(): Promise<boolean | void> {
    if (!this.clientId) {
      console.error('Client ID is required');
      return false;
    }
    const client = new ApiClient(this.environment);
    try {
      const data = await client.verifyClient(this.clientId);
      if (data.ok) {
        // success
      } else {
        console.error('Client Id verification failed', data.error);
        return false;
      }
    } catch (err) {
      console.error('Client ID verification failed', err);
      return true;
    }

    this.buttons.forEach((btnType) => {
      const button = document.createElement('button');
      button.style.minWidth = '250px';
      button.style.margin = '5px';
      button.style.padding = '8px 16px';
      button.style.border = '1px solid #e0e0e0';
      button.style.borderRadius = '999px';
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
        case FEATURE_PAYIN.feature: {
          button.innerHTML = this.innerHtmlPay;
          button.disabled = true;
          button.style.opacity = '0.4';
          this.payNowButton = button;
          button.id = '#pay';
          if (typeof btnType.inject === 'boolean' && !btnType.inject) {
            return;
          }
          const container = document.getElementById(btnType.containerId ?? ContainerId);
          if (!container) {
            console.error('Container not found.');
            return;
          }
          button.onclick = async () => {
            if (this.iframeService.iframe) return;
            if (!this.uuid) {
              console.warn('Cart data is not prepared');
              return;
            }
            this.setLoadingState(true);
            try {
              const { placeOrder } = await import('./features/payin');
              await placeOrder(this.clientId, this.redirect, this.uuid, this.environment);
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
        }

        case FEATURE_AGE_VERIFICATION.feature: {
          button.innerHTML = this.innerHtmlVerify;
          button.id = '#age';
          const container2 = document.getElementById(btnType.containerId ?? ContainerId);
          if (!container2 && btnType.inject) {
            console.error('Container not found.');
            return;
          }
          button.onclick = async () => {
            const { initializeWidget, launchAgeVerificationWidget } =
              await import('./features/zkp');
            if (!this.zkpInitialized) {
              initializeWidget(this.clientId, this.environment, this.redirect);
              this.zkpInitialized = true;
            }
            launchAgeVerificationWidget(this.userInfo);
          };
          if (btnType.inject === undefined || btnType.inject === null || btnType.inject) {
            if (container2 && !document.getElementById('#age')) {
              container2.appendChild(button);
            }
          }
          break;
        }

        default:
          console.warn(`Unknown button: ${btnType.feature}`);
      }
    });

    window.addEventListener('message', this.handleMessage.bind(this));
  }

  public setUserInfo(userInfo: UserInfo): void {
    this.userInfo = userInfo;
  }

  public prepareOrder(uuid: string): void {
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

  private handleMessage(event: MessageEvent): void {
    const data = event.data;
    if (data.type === EVENTS.CLOSE_MODAL) {
      this.iframeService.closeIframe();
    }
    if (data.type === 'initialize_widget') {
      const access = localStorage.getItem('access');
      const payload = {
        access,
        clientId: this.clientId,
        userInfo: this.userInfo,
        countries: this.buttons
          .map((btn) => btn.countries)
          .filter((c): c is string[] => c !== undefined)[0],
      };
      if (this.iframeService.iframe?.contentWindow && access) {
        this.iframeService.iframe.contentWindow.postMessage(
          { type: 'initialize_widget', data: payload },
          '*'
        );
      }
    }
    if (data.type === 'rocketfuel_change_height') {
      this.iframeService.setIframeHeight(data.data);
      this.iframeService.iframe?.contentWindow?.postMessage(
        { type: 'rocketfuel_return_width', data: window.outerWidth },
        '*'
      );
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

  public async launchAgeVerificationWidget(): Promise<void> {
    const { initializeWidget, launchAgeVerificationWidget } = await import('./features/zkp');
    if (!this.zkpInitialized) {
      initializeWidget(this.clientId, this.environment, this.redirect);
      this.zkpInitialized = true;
    }
    launchAgeVerificationWidget(this.userInfo);
  }

  public async launchPaymentWidget(uuid: string): Promise<void> {
    if (this.iframeService.iframe) return;
    if (!uuid) {
      console.warn('Cart data is not prepared');
      return;
    }
    try {
      const { placeOrder } = await import('./features/payin');
      await placeOrder(this.clientId, this.redirect, uuid, this.environment);
    } catch (err) {
      console.error('Error during order placement:', err);
    }
  }

  public async verifyAgeVerification(auditId: string): Promise<unknown> {
    return verifier(auditId, this.environment);
  }
}
