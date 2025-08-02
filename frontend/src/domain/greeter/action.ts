/**
 * Say hello function for the greeter domain
 */
export async function sayHello(request: { name: string }): Promise<{ message: string }> {
  const response = await fetch('http://localhost:49999/api/greeter/say-hello', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}