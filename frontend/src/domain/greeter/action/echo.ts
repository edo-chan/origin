interface EchoRequest {
  message: string;
}

interface EchoResponse {
  message: string;
}

/**
 * Send an echo message to the backend
 */
export const sendEcho = async (request: EchoRequest): Promise<EchoResponse> => {
  try {
    const response = await fetch('/api/echo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending echo:', error);
    throw error;
  }
};