export interface RocketFuelOptions {
  clientId: string;
  clientSecret: string;
  environment: "prod" | "qa" | "preprod" | "sandbox";
  merchantId: string;
}

export const apiDomains = {
  prod: 'https://app.rocketfuel.inc/api',
  qa: 'https://qa-app.rfdemo.co/api',
  preprod: 'https://preprod-app.rocketdemo.net/api',
  sandbox: 'https://app-sandbox.rocketfuel.inc/api',
} as const;

type EnvKey = keyof typeof apiDomains;

export function getBaseUrl(env: EnvKey): string {
  return apiDomains[env];
}