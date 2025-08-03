/**
 * Greeter action functions using generated proto types
 */
import type { HelloRequest, HelloResponse } from '@/proto/greeter';

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:49999';

export async function sayHello(request: HelloRequest): Promise<HelloResponse> {
  const response = await fetch(`${API_BASE_URL}/api/greeter/say-hello`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}