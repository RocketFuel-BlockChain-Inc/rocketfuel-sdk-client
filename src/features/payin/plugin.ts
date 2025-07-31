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
  clientId: string;

  constructor(options: RocketFuelOptions) {
    this.clientId = options.clientId;
    this.domain = getBaseUrl(options.environment)
    this.initialize()
  }
  handleMessage(event: MessageEvent) {
    const data = event.data;
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
    IframeUtiltites.showOverlay(open);
  }


}

// Export RocketFuel
export default RocketFuel;