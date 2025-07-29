export interface RocketFuelOptions {
  clientId: string;
  clientSecret: string;
  environment: "prod" | "stage2" | "local" | "preprod" | "dev" | "sandbox";
  merchantId: string;
}



export const iframeUrls = {
  prod: 'https://iframe.rocketfuelblockchain.com',
  stage2: 'https://qa-iframe.rocketdemo.net/',
  local: 'http://localhost:8080',
  preprod: 'https://preprod-iframe.rocketdemo.net/',
  dev: 'https://dev-iframe.rocketdemo.net/',
  sandbox: 'https://iframe-sandbox.rocketfuelblockchain.com',
} as const;

export const apiDomains = {
  prod: 'https://app.rocketfuel.inc/api',
  stage2: 'https://qa-app.rfdemo.co/api',
  local: 'http://localhost:3001/api',
  preprod: 'https://preprod-app.rocketdemo.net/api',
  dev: 'https://dev-app.rocketdemo.net/api',
  sandbox: 'https://app-sandbox.rocketfuel.inc/api',
} as const;

type EnvKey = keyof typeof apiDomains; // "prod" | "stage2" | "local" | "preprod" | "dev" | "sandbox"

export function getBaseUrl(env: EnvKey): string {
  return apiDomains[env];
}