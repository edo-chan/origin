import type { HelloRequest, HelloResponse } from '@/proto/greeter';

// Base URL for API requests
const getBaseUrl = () => {
  // Always use the Next.js server's /api route for client-side requests
  // This will be rewritten to proxy to envoy:8080 in Docker or localhost:49999 locally
  if (typeof window !== 'undefined') {
    return '';  // Use relative URLs for client-side requests
  }

  // For server-side rendering, use the backend URL directly
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
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
    const response = await fetch(`/api/greeter/say-hello`, {
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