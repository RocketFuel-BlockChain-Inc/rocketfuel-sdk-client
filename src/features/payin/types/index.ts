import { apiDomains, paymentAppDomains } from "../../../utils/constants";

export interface RocketFuelOptions {
  clientId: string;
  environment: "prod" | "qa" | "preprod" | "sandbox";
}
type EnvKey = keyof typeof apiDomains;
export function getBaseUrl(env: EnvKey): string {
  return paymentAppDomains[env];
}
export function getApiDomains(env: EnvKey): string {
  return apiDomains[env];
}