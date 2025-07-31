import { apiDomains } from "../../../utils/constants";
export interface RocketFuelOptions {
    clientId: string;
    environment: "prod" | "qa" | "preprod" | "sandbox";
}
type EnvKey = keyof typeof apiDomains;
export declare function getBaseUrl(env: EnvKey): string;
export {};
