import { ZKP } from "./plugin";

let zkpInstance: ZKP;
export const initializeWidget = (clientId: string, env: "prod" | "qa" | "preprod" | "sandbox"): void => {
    zkpInstance = new ZKP(clientId, env);
}
export const launchWidget = (): void => {
    zkpInstance.initialize();
}