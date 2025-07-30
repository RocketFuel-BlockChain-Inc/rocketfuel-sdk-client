export const FEATURE_PAYIN = 'FEATURE_PAYIN';
export const FEATURE_AGE_VERIFICATION = 'FEATURE_AGE_VERIFICATION';
export const apiDomains = {
  prod: 'https://app.rocketfuel.inc/api',
  qa: 'https://qa-app.rfdemo.co/api',
  preprod: 'https://preprod-app.rocketdemo.net/api',
  sandbox: 'https://app-sandbox.rocketfuel.inc/api',
} as const;

export const appDomains = {
  prod: 'http://localhost:3000',
  qa: 'http://localhost:3000',
  preprod: 'http://localhost:3000',
  sandbox: 'http://localhost:3000',
} as const;
