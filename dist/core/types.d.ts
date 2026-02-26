/**
 * Shared SDK types - used across features for loose coupling.
 */
export type Environment = 'production' | 'qa' | 'preprod' | 'sandbox';
export interface UserInfo {
    email?: string;
    userId?: string;
}
export interface ButtonConfig {
    feature: 'PAYIN' | 'AGE_VERIFICATION';
    style?: string;
    containerStyle?: string;
    containerId?: string;
    inject?: boolean;
    countries?: string[];
}
export interface SDKConfig {
    clientId: string;
    environment: Environment;
    redirect?: boolean;
    plugins: ButtonConfig[];
}
