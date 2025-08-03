/**
 * Auth action functions for the auth domain
 * These functions handle backend communication through the backend API
 */

import type {
  InitiateOAuthRequest,
  InitiateOAuthResponse,
  CompleteOAuthRequest,
  CompleteOAuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  GetProfileRequest,
  GetProfileResponse,
  LogoutRequest,
  LogoutResponse,
  LogoutAllRequest,
  LogoutAllResponse,
  GetUserSessionsRequest,
  GetUserSessionsResponse,
  RevokeSessionRequest,
  RevokeSessionResponse,
} from '@/proto/auth';

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:49999';

export async function initiateOAuth(request: InitiateOAuthRequest): Promise<InitiateOAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/oauth/google/initiate`, {
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

export async function completeOAuth(request: CompleteOAuthRequest): Promise<CompleteOAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/oauth/google/complete`, {
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

export async function refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
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

export async function validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
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

export async function getProfile(request: GetProfileRequest): Promise<GetProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
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

export async function logout(request: LogoutRequest): Promise<LogoutResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
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

export async function logoutAll(request: LogoutAllRequest): Promise<LogoutAllResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout-all`, {
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

export async function getUserSessions(request: GetUserSessionsRequest): Promise<GetUserSessionsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/sessions`, {
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

export async function revokeSession(request: RevokeSessionRequest): Promise<RevokeSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/sessions/revoke`, {
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