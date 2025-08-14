import { ZKP } from "./plugin";
import { UserInfo } from "./types";

let zkpInstance: ZKP;
export const initializeWidget = (clientId: string, env: "production" | "qa" | "preprod" | "sandbox", redirect: boolean): void => {
    zkpInstance = new ZKP(clientId, env, redirect);
}
export const launchAgeVerificationWidget = (userInfo?: UserInfo): void => {
    if(!zkpInstance) {
        throw new Error('SDK not initialized properly')
    }
    zkpInstance.initialize(userInfo);
}