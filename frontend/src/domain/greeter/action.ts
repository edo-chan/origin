/**
 * Say hello function for the greeter domain
 */
export async function sayHello(request: { name: string }): Promise<{ message: string }> {
  console.log('Sending request to:', 'http://localhost:49999/api/greeter/say-hello');
  console.log('Request payload:', request);
  
  const response = await fetch('http://localhost:49999/api/greeter/say-hello', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(request),
  });

  console.log('Response status:', response.status, response.statusText);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.log('Error response body:', errorText);
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const responseText = await response.text();
  console.log('Response body (raw):', responseText);
  
  try {
    const jsonData = JSON.parse(responseText);
    console.log('Parsed JSON:', jsonData);
    return jsonData;
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.log('Response was not valid JSON:', responseText);
    throw new Error(`Invalid JSON response: ${responseText}`);
  }
}