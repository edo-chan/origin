import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { public_token, user_id, institution_name } = req.body;

    // Forward request to backend gRPC service via Envoy proxy
    const backendResponse = await fetch('http://localhost:49999/api/accounts/plaid/exchange-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_token,
        user_id,
        institution_name,
      }),
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({ 
      error: 'Failed to exchange public token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}