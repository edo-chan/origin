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

export async function initiateOAuth(request: InitiateOAuthRequest): Promise<InitiateOAuthResponse> {
  console.log('🚀 Auth Action: Starting OAuth initiation', request);
  
  try {
    const response = await fetch('http://localhost:49999/api/auth/oauth/google/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('📡 Auth Action: Got response', { 
      status: response.status, 
      ok: response.ok,
      statusText: response.statusText 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Auth Action: Request failed', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText 
      });
      throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Auth Action: Success', result);
    return result;
  } catch (error) {
    console.error('💥 Auth Action: Exception caught', error);
    throw error;
  }
}

export async function completeOAuth(request: CompleteOAuthRequest): Promise<CompleteOAuthResponse> {
  const response = await fetch('http://localhost:49999/api/auth/oauth/google/complete', {
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

export async function refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  const response = await fetch('http://localhost:49999/api/auth/refresh', {
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

export async function validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
  const response = await fetch('http://localhost:49999/api/auth/validate', {
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

export async function getProfile(request: GetProfileRequest): Promise<GetProfileResponse> {
  const response = await fetch('http://localhost:49999/api/auth/profile', {
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

export async function logout(request: LogoutRequest): Promise<LogoutResponse> {
  const response = await fetch('http://localhost:49999/api/auth/logout', {
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

export async function logoutAll(request: LogoutAllRequest): Promise<LogoutAllResponse> {
  const response = await fetch('http://localhost:49999/api/auth/logout-all', {
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

export async function getUserSessions(request: GetUserSessionsRequest): Promise<GetUserSessionsResponse> {
  const response = await fetch('http://localhost:49999/api/auth/sessions', {
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

export async function revokeSession(request: RevokeSessionRequest): Promise<RevokeSessionResponse> {
  const response = await fetch('http://localhost:49999/api/auth/sessions/revoke', {
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