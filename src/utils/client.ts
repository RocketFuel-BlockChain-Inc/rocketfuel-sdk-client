import { getApiDomains } from "../features/payin/types";
import CryptoJS from 'crypto-js';
import IframeUtiltites from "./IframeUtilities";
class ApiClient {
    private domain: string;
    constructor(env: "prod" | "qa" | "preprod" | "sandbox") {
        this.domain = getApiDomains(env)
    }

    encrypt(data: string, clientId: string) {
        return CryptoJS.AES.encrypt(data, clientId).toString();
    };

    async verifyClient(clientId: string) {
        const data = {
            clientUrl: window.location.protocol + '//' + window.location.host
        }
        const cipher = this.encrypt(JSON.stringify(data), clientId)
        const payload = {
            clientId,
            encryptedReq: cipher
        };

        try {
            const response = await fetch(this.domain + '/sdk/generate-auth-token', {
                method: "POST",
                headers: {
                    "x-sdk-version": '0.0.1',
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok || data.ok === false) {
                return { ok: false, error: data?.message }
            }

            localStorage.setItem('access', data.result.access_token)


            // Success
            return {
                ok: true,
            };
        } catch (err: any) {
            console.error("Request failed:", err);
            return { ok: false, error: err?.message }
        }
    }

}
export default ApiClient;