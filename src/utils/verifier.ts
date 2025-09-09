import { getApiDomains } from "../features/payin/types";

export const verifier = async (auditId: string, env: any): Promise<{data?:any, error?: any}> => {
    try {
        const domain = getApiDomains(env);
        const data = await fetch(`${domain}/user/audit/${auditId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
            },
        });
        if (!data.ok) {
            throw new Error('Verification failed');
        }
        return { data: await data.json() };
    }catch(err) {
        console.error('Verification failed', err);
        return { error: err }
    }
}