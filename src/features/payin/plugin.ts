// RocketFuel SDK - TypeScript Version

import { dragElement } from "./dragger";
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
    this.showOverlay(url);
  }

  private createIFrame(url: string) {
    const iframe = document.createElement('iframe');
    iframe.title = 'Rocketfuel';
    iframe.style.display = 'none';
    iframe.style.backgroundColor = 'transparent';
    iframe.style.border = '0';
    iframe.style.width = '410px';
    iframe.src = url;
    return iframe;
  }

  showOverlay(url: string) {
    const iframe = this.createIFrame(url)
    const wrapper = dragElement();
    iframe.style.display = 'block';
    iframe.style.height = '800px';
    iframe.style.border = '1px solid #dddddd';
    iframe.style.borderRadius = '8px';

    wrapper.appendChild(iframe);
    document.body.appendChild(wrapper);
  }

}

// Export RocketFuel
export default RocketFuel;