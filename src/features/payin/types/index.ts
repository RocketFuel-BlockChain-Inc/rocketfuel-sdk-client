import { apiDomains } from "../../../utils/constants";

export interface RocketFuelOptions {
  clientId: string;
  clientSecret: string;
  environment: "prod" | "qa" | "preprod" | "sandbox";
  merchantId: string;
}
type EnvKey = keyof typeof apiDomains;
export function getBaseUrl(env: EnvKey): string {
  return apiDomains[env];
}