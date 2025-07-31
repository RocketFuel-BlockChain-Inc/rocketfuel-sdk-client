import { ZKP } from "./plugin";

let zkpInstance: ZKP;
export const initializeWidget = (clientId: string, env: "prod" | "qa" | "preprod" | "sandbox", redirect: boolean): void => {
    zkpInstance = new ZKP(clientId, env, redirect);
}
export const launchWidget = (): void => {
    zkpInstance.initialize();
}