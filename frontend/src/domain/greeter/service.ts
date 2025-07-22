import { HelloRequest, HelloResponse } from './types';

// Base URL for API requests
// When running in Docker, use the service name as hostname
// When running locally or in browser, use the current hostname with port 8080
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // Check if we're running in a browser environment
  if (typeof window !== 'undefined') {
    // Use the current hostname with port 8080
    return `http://${window.location.hostname}:8080`;
  }

  // Default for server-side rendering in Docker
  return 'http://envoy:8080';
};

const baseUrl = getBaseUrl();

/**
 * Service layer for the Greeter domain
 * Handles communication with the API using fetch
 */
export const GreeterService = {
  /**
   * Say hello to the server
   * @param request The hello request containing the name
   * @returns A promise that resolves to the hello reply
   */
  sayHello: async (request: HelloRequest): Promise<HelloResponse> => {
    try {
      const response = await fetch(`${baseUrl}/service.Greeter/SayHello`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if the response has content before trying to parse it
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      // Parse the text as JSON
      const data = JSON.parse(text);
      return data as HelloResponse;
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  }
};
