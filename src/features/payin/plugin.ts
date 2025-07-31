// RocketFuel SDK - TypeScript Version

import IframeUtiltites from "../../utils/IframeUtilities";
import { getBaseUrl, RocketFuelOptions } from "./types";
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
  private success_event: string = "rocketfuel_result_ok";
  clientId: string;

  constructor(options: RocketFuelOptions) {
    this.clientId = options.clientId;
    this.domain = getBaseUrl(options.environment)
    this.initialize()
  }
  handleMessage(event: MessageEvent) {
    const eventData = event.data;
    if (eventData.type === this.success_event) {
      if (eventData.paymentCompleted === 1) {
        const t = setTimeout(() => {
          IframeUtiltites.closeIframe();
          t ?? clearTimeout(t)
        }, 5000)
      }
    }
  }
  private initialize() {
    window.addEventListener("message", this.handleMessage);
  }

  public async openRedirect(uuid: string) {
    const open = `${this.domain}/${uuid}`
    window.open(open, '_blank')
  }

  public async openIframe(uuid: string) {
    const open = `${this.domain}/${uuid}`
    IframeUtiltites.showOverlay(open, true);
  }


}

// Export RocketFuel
export default RocketFuel;