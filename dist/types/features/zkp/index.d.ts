import { UserInfo } from "./types";
export declare const initializeWidget: (clientId: string, env: "prod" | "qa" | "preprod" | "sandbox", redirect: boolean) => void;
export declare const launchAgeVerificationWidget: (userInfo?: UserInfo) => void;
