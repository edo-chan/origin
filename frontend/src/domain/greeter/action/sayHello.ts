import type { HelloRequest, HelloResponse } from '@/proto/greeter';
import { apiClient } from '../../../utils/apiClient';

/**
 * Say hello to the server via gRPC (proxied through Next.js API routes)
 */
export const sayHello = async (request: HelloRequest): Promise<HelloResponse> => {
  try {
    return await apiClient.post<HelloRequest, HelloResponse>('/greeter/say-hello', request);
  } catch (error) {
    console.error('Error calling sayHello API:', error);
    throw error;
  }
};