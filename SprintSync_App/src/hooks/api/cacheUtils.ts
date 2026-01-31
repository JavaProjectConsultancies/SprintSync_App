// Shared caching utilities for API hooks
// Provides generic caching infrastructure to avoid code duplication
import { secureStorage } from '../../services/api/encryptionUtils';
import { API_CONFIG } from '../../services/api/config';

const TOKEN_KEY = 'sprintsync_token';

export interface EntityCache<T> {
    data: T[] | null;
    timestamp: number;
    promise: Promise<T[]> | null;
    userId: string | null;
    abortController: AbortController | null;
}

export interface CacheConfig {
    cacheTTL: number;          // Time-to-live for memory cache
    staleTime: number;         // Time before data is considered stale
    persistentCacheTTL: number; // TTL for localStorage cache
    cacheKey: string;          // localStorage key
}

// Default cache configuration
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
    cacheTTL: 300000,          // 5 minutes
    staleTime: 60000,          // 1 minute
    persistentCacheTTL: 600000, // 10 minutes
    cacheKey: '',              // Must be overridden
};

/**
 * Create an empty entity cache
 */
export function createEntityCache<T>(): EntityCache<T> {
    return {
        data: null,
        timestamp: 0,
        promise: null,
        userId: null,
        abortController: null,
    };
}

/**
 * Fast normalization function - handles various API response formats
 */
export function normalizeApiData<T>(responseData: any): T[] {
    if (Array.isArray(responseData)) {
        return responseData;
    }
    if (responseData?.content && Array.isArray(responseData.content)) {
        return responseData.content;
    }
    if (responseData?.data) {
        return normalizeApiData(responseData.data);
    }
    return [];
}

/**
 * Get data from localStorage persistent cache
 */
export function getPersistentCache<T>(
    cacheKey: string,
    userId: string | null,
    ttl: number
): T[] | null {
    try {
        const token = secureStorage.getItem(TOKEN_KEY, API_CONFIG.SIGNING_KEY);
        if (!token) return null;

        const parsed = secureStorage.getItem(cacheKey, token);
        if (!parsed) return null;

        const now = Date.now();

        // Check if cache is valid and for the same user
        if (
            parsed.userId === userId &&
            parsed.data &&
            Array.isArray(parsed.data) &&
            (now - parsed.timestamp) < ttl
        ) {
            return parsed.data;
        }

        // Clean up stale cache
        secureStorage.removeItem(cacheKey);
        return null;
    } catch {
        return null;
    }
}

/**
 * Save data to localStorage persistent cache
 */
export function setPersistentCache<T>(
    cacheKey: string,
    data: T[],
    userId: string | null
): void {
    try {
        const token = secureStorage.getItem(TOKEN_KEY, API_CONFIG.SIGNING_KEY);
        if (!token) return;

        secureStorage.setItem(
            cacheKey,
            {
                data,
                userId,
                timestamp: Date.now(),
            },
            token
        );
    } catch {
        // Ignore localStorage errors (quota exceeded, etc.)
    }
}

/**
 * Clear persistent cache for a specific key
 */
export function clearPersistentCache(cacheKey: string): void {
    try {
        localStorage.removeItem(cacheKey);
    } catch {
        // Ignore errors
    }
}

/**
 * Invalidate entity cache - resets both memory and persistent cache
 */
export function invalidateEntityCache<T>(
    cache: EntityCache<T>,
    cacheKey: string,
    userId?: string
): EntityCache<T> {
    // Cancel any pending requests
    if (cache.abortController) {
        cache.abortController.abort();
    }

    if (!userId || cache.userId === userId) {
        clearPersistentCache(cacheKey);
        return {
            data: null,
            timestamp: 0,
            promise: null,
            userId: userId || null,
            abortController: null,
        };
    }

    return cache;
}

/**
 * Check if cache is fresh (within stale time)
 */
export function isCacheFresh(timestamp: number, staleTime: number): boolean {
    return (Date.now() - timestamp) < staleTime;
}

/**
 * Check if cache is valid (within TTL)
 */
export function isCacheValid(timestamp: number, cacheTTL: number): boolean {
    return (Date.now() - timestamp) < cacheTTL;
}
