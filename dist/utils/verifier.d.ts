type EnvKey = 'production' | 'qa' | 'preprod' | 'sandbox';
export declare const verifier: (auditId: string, env: EnvKey) => Promise<{
    data?: unknown;
    error?: unknown;
}>;
export {};
