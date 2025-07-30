// RocketFuel SDK - TypeScript Version

import { dragElement } from "../../utils/dragger";
import IframeUtiltites from "../../utils/IframeUtilities";
import { getBaseUrl, RocketFuelOptions } from "./types";
import crypto from 'crypto';
// Version: 1.0.1
declare global {
  interface Window {
    token: string;
    refresh: string;
  }
}

class RocketFuel {
  private domain: string;
  public rkflToken: any = null;
  clientId: string;
  clientSecret: string;
  merchantId: string;

  constructor(options: RocketFuelOptions) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.domain = getBaseUrl(options.environment)
    this.merchantId = options.merchantId;
    this.initialize()
  }
  handleMessage(event: MessageEvent) {
    const data = event.data;
    console.log("Received from iframe:", data);
  }
  private initialize() {
    window.addEventListener("message", this.handleMessage);
  }
  getAuthPayload() {
    return CryptoJS.AES.encrypt(JSON.stringify({
      merchantId: this.merchantId,
      totop: ''
    }), this.clientSecret).toString();
  }
  client() {
    const headers: any = { 'Content-Type': 'application/json' };
    const access = window.localStorage.getItem('token');
    if (access) {
      headers['Authorization'] = `Bearer ${access}`;
    }
    return {
      post: (path: string, payload: any) => fetch(`${this.domain}${path}`, {
        headers,
        method: 'POST',
        body: JSON.stringify(payload)
      })
    }
  }
  async getAccessToken() {
    const response = await this.client().post(`/auth/generate-auth-token`, {
      clientId: this.clientId,
      encryptedPayload: this.getAuthPayload()
    })
    const data: any = await response.json();
    const tokens = data?.result;
    window.localStorage.setItem('token', tokens.access);
    window.localStorage.setItem('refresh', tokens.refresh);
  }
  public async purchaseCheck(payload: any) {
    await this.getAccessToken();
    const response = await this.client().post('/hosted-page', payload);
    const data: any = await response.json();
    return data?.result;
  }

  public async openRedirect(url: string) {
    window.open(url, '_blank')
  }

  public async openIframe(url: string) {
    IframeUtiltites.showOverlay(url);
  }


}

// Export RocketFuel
export default RocketFuel;