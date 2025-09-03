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
  production: process.env.API_DOMAIN_PROD as string,
  qa: process.env.API_DOMAIN_QA as string,
  preprod: process.env.API_DOMAIN_PREPROD as string,
  sandbox: process.env.API_DOMAIN_SANDBOX as string,
} as const;

export const paymentAppDomains = {
  production: process.env.PAYMENT_APP_DOMAIN_PROD as string,
  qa: process.env.PAYMENT_APP_DOMAIN_QA as string,
  preprod: process.env.PAYMENT_APP_DOMAIN_PREPROD as string,
  sandbox: process.env.PAYMENT_APP_DOMAIN_SANDBOX as string,
} as const;

export const appDomains = {
  production: process.env.APP_DOMAIN_PROD as string,
  qa: process.env.APP_DOMAIN_QA as string,
  preprod: process.env.APP_DOMAIN_PREPROD as string,
  sandbox: process.env.APP_DOMAIN_SANDBOX as string,
} as const;
export const ContainerId = 'sdk-buttons-container' as const;

export const EVENTS = {
  AGE_VERIFICATION: "AGE_VERIFICATION",
  CLOSE_MODAL: "CLOSE_MODAL"
}
export const appEnv = process.env.NODE_ENV as string;