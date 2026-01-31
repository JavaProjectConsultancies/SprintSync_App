import CryptoJS from 'crypto-js';

/**
 * Encrypts data using AES
 * @param data The data to encrypt (object or string)
 * @param secret The secret key to use for encryption
 * @returns Encrypted string
 */
export const encrypt = (data: any, secret: string): string => {
    if (!data || !secret) return '';
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(stringData, secret).toString();
};

/**
 * Decrypts data using AES
 * @param cipherText The encrypted string
 * @param secret The secret key used for encryption
 * @returns Decrypted data (parsed JSON if applicable, otherwise string)
 */
export const decrypt = (cipherText: string, secret: string): any => {
    if (!cipherText || !secret) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, secret);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        if (!originalText) return null;

        try {
            return JSON.parse(originalText);
        } catch {
            return originalText;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

/**
 * Higher-level wrapper for localStorage with encryption
 */
export const secureStorage = {
    /**
     * Store item in localStorage (encrypted)
     */
    setItem: (key: string, value: any, secret: string) => {
        if (!key || value === undefined || !secret) return;
        const encrypted = encrypt(value, secret);
        localStorage.setItem(key, encrypted);
    },

    /**
     * Get item from localStorage (decrypted)
     */
    getItem: (key: string, secret: string): any => {
        if (!key || !secret) return null;
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;
        return decrypt(encrypted, secret);
    },

    /**
     * Remove item from localStorage
     */
    removeItem: (key: string) => {
        localStorage.removeItem(key);
    }
};
