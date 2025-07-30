import type { HelloRequest, HelloResponse } from '@/proto/greeter';

// Base URL for API requests
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
 * Say hello to the server via gRPC
 */
export const sayHello = async (request: HelloRequest): Promise<HelloResponse> => {
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
};