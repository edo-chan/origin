/**
 * Fetch utility for GET requests from the backend for greeter domain
 * Handles data retrieval operations through Next.js API routes
 */

const BASE_URL = '';

interface FetchOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

interface FetchResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

class GreeterFetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: any
  ) {
    super(message);
    this.name = 'GreeterFetchError';
  }
}

/**
 * Generic GET request handler for greeter domain
 */
export async function get<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  const { headers = {}, timeout = 10000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`http://localhost:49999${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new GreeterFetchError(
        `Fetch failed: ${response.status} ${response.statusText}`,
        response.status,
        response.statusText,
        errorData
      );
    }

    const data = await response.json();

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof GreeterFetchError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new GreeterFetchError('Request timeout', 408, 'Request Timeout');
    }
    
    throw new GreeterFetchError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0,
      'Network Error'
    );
  }
}

/**
 * GET request with query parameters for greeter
 */
export async function getWithParams<T = any>(
  endpoint: string,
  params: Record<string, string | number | boolean>,
  options?: FetchOptions
): Promise<FetchResponse<T>> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const url = searchParams.toString() 
    ? `${endpoint}?${searchParams.toString()}`
    : endpoint;

  return get<T>(url, options);
}

export { GreeterFetchError };
export type { FetchOptions, FetchResponse };