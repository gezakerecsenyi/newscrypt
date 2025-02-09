import {createHash} from "crypto";

export function rfc3986EncodeURIComponent(str: string) {
    return encodeURIComponent(str).replace(
        /[!'()*]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    );
}

export const getHashedPassword = (password: string) => {
    const shasum = createHash('sha256');
    shasum.update(`2802581762944_${password}`);
    return shasum.digest('hex');
}

export const postgresHost = `dpg-cuk9fi52ng1s73bfjtsg-a`;
export const postgresConfig = {
    user: 'newscrypt_user',
    host: postgresHost,
    database: 'newscrypt',
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
};