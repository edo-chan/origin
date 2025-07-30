// Simple UUID v4 generator for frontend use
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get or create a persistent user ID for the session
export function getUserId(): string {
  const key = 'user_id';
  let userId = localStorage.getItem(key);
  
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem(key, userId);
  }
  
  return userId;
}