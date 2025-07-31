export const FEATURE_PAYIN = {
  feature: "PAYIN", // Add other valid features
  style: 'default',
  containerStyle: 'default',
  containerId: 'default',
} as const;
export const FEATURE_AGE_VERIFICATION = {
  feature: "AGE_VERIFICATION", // Add other valid features
  style: 'default',
  containerStyle: 'default',
  containerId: 'default',
} as const;
export const apiDomains = {
  prod: 'https://app.rocketfuel.inc/api',
  qa: 'https://qa-app.rfdemo.co/api',
  preprod: 'https://preprod-app.rocketdemo.net/api',
  sandbox: 'https://app-sandbox.rocketfuel.inc/api',
} as const;

export const paymentAppDomains = {
  prod: 'https://payments.rocketfuel.inc/select-currency',
  qa: 'https://qa-payment.rfdemo.co/select-currency',
  preprod: 'https://preprod-payment.rocketdemo.net/select-currency',
  sandbox: 'https://payments-sandbox.rocketfuelblockchain.com/select-currency',
} as const;

export const appDomains = {
  prod: 'http://localhost:3000',
  qa: 'http://localhost:3000',
  preprod: 'http://localhost:3000',
  sandbox: 'http://localhost:3000',
} as const;

export const ContainerId = 'sdk-buttons-container' as const;

export const EVENTS = {
  AGE_VERIFICATION: "AGE_VERIFICATION",
  CLOSE_MODAL: "CLOSE_MODAL"
}