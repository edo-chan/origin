/**
 * API Client utility for frontend to backend communication
 * Uses Next.js API routes as a proxy to the backend via envoy
 */

export class ApiClient {
  private baseUrl: string;

  constructor() {
    // Always use Next.js API routes for client-side requests
    // These will proxy to the backend via envoy
    this.baseUrl = '';
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Make a POST request
   */
  async post<T, R = any>(endpoint: string, data: T): Promise<R> {
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Make a PUT request
   */
  async put<T, R = any>(endpoint: string, data: T): Promise<R> {
    const response = await fetch(`/api${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Make a DELETE request
   */
  async delete<R = any>(endpoint: string): Promise<R> {
    const response = await fetch(`/api${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience
export const { get, post, put, delete: del } = apiClient;