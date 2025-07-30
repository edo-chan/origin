import type { NextApiRequest, NextApiResponse } from 'next';

const getBackendUrl = () => {
  // In Docker, use the envoy service
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  
  // Default to envoy service in Docker network
  return 'http://envoy:8080';
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/greeter/say-hello`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend responded with status: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      const text = await response.text();
      if (text) {
        // Try to parse as JSON in case content-type header is missing
        try {
          const data = JSON.parse(text);
          res.status(200).json(data);
        } catch {
          // If not JSON, return as text
          res.status(200).json({ message: text });
        }
      } else {
        throw new Error('Empty response from backend');
      }
    }
  } catch (error) {
    console.error('Error proxying to backend:', error);
    res.status(500).json({ 
      error: 'Failed to communicate with backend',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}