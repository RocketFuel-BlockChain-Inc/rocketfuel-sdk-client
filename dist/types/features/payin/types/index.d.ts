import { apiDomains } from "../../../utils/constants";
export interface RocketFuelOptions {
    clientId: string;
    environment: "production" | "qa" | "preprod" | "sandbox";
}
type EnvKey = keyof typeof apiDomains;
export declare function getBaseUrl(env: EnvKey): string;
export declare function getApiDomains(env: EnvKey): string;
export {};
