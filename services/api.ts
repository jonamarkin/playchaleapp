const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';

interface ApiConfig {
    baseUrl: string;
    headers: Record<string, string>;
}

const defaultConfig: ApiConfig = {
    baseUrl: API_BASE_URL.replace(/\/$/, ''),
    headers: {
        'Content-Type': 'application/json',
    },
};

/**
 * Generic API response type
 */
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
}

/**
 * API Error class for handling API-specific errors
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
        public data?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        if (!defaultConfig.baseUrl && endpoint.startsWith('http') === false) {
            throw new ApiError(500, 'NEXT_PUBLIC_API_BASE_URL is not configured');
        }

        const url = endpoint.startsWith('http')
            ? endpoint
            : `${defaultConfig.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            credentials: 'include',
            ...options,
            headers: {
                ...defaultConfig.headers,
                ...options.headers,
            },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new ApiError(
                response.status,
                data?.message || 'An error occurred',
                data
            );
        }

        return {
            data,
            error: null,
            status: response.status,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            return {
                data: null,
                error: error.message,
                status: error.status,
            };
        }

        return {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 500,
        };
    }
}

export const isMockBackend = () => {
    const source = process.env.NEXT_PUBLIC_DATA_SOURCE || process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA;
    return source !== 'http' && source !== 'false';
};

/**
 * HTTP method helpers
 */
export const api = {
    get: <T>(endpoint: string, options?: RequestInit) =>
        fetchApi<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
        fetchApi<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        }),

    put: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
        fetchApi<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        }),

    patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
        fetchApi<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
        fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Set authorization header for authenticated requests
 */
export function setAuthToken(token: string | null) {
    if (token) {
        defaultConfig.headers['Authorization'] = `Bearer ${token}`;
    } else {
        delete defaultConfig.headers['Authorization'];
    }
}
