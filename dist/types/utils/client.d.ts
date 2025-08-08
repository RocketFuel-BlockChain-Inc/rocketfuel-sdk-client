declare class ApiClient {
    private domain;
    constructor(env: "prod" | "qa" | "preprod" | "sandbox");
    encrypt(data: string, clientId: string): string;
    verifyClient(clientId: string): Promise<{
        ok: boolean;
        error: any;
    } | {
        ok: boolean;
        error?: undefined;
    }>;
}
export default ApiClient;
