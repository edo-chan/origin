/**
 * Legacy auth service - kept for backward compatibility
 * New code should use action.ts functions instead
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
  GetUserSessionsRequest,
  GetUserSessionsResponse,
  LogoutRequest,
  LogoutResponse,
  LogoutAllRequest,
  LogoutAllResponse,
  RevokeSessionRequest,
  RevokeSessionResponse
} from '@/proto/auth';

export class AuthService {
  async initiateOAuth(request: InitiateOAuthRequest): Promise<InitiateOAuthResponse> {
    const response = await fetch('http://localhost:49999/api/auth/oauth/google/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async handleOAuthCallback(request: CompleteOAuthRequest): Promise<CompleteOAuthResponse> {
    const response = await fetch('http://localhost:49999/api/auth/oauth/google/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await fetch('http://localhost:49999/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    const response = await fetch('http://localhost:49999/api/auth/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async getUserProfile(accessToken: string): Promise<GetProfileResponse> {
    const response = await fetch('http://localhost:49999/api/auth/profile', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async updateUserProfile(request: any): Promise<any> {
    const response = await fetch('http://localhost:49999/api/auth/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async logout(request: LogoutRequest): Promise<LogoutResponse> {
    const response = await fetch('http://localhost:49999/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async logoutAllDevices(request: LogoutAllRequest, accessToken: string): Promise<LogoutAllResponse> {
    const response = await fetch('http://localhost:49999/api/auth/logout-all', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async getActiveSessions(request: GetUserSessionsRequest, accessToken: string): Promise<GetUserSessionsResponse> {
    const response = await fetch('http://localhost:49999/api/auth/sessions', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async revokeSession(request: RevokeSessionRequest, accessToken: string): Promise<RevokeSessionResponse> {
    const response = await fetch(`http://localhost:49999/api/auth/sessions/${request.sessionId}/revoke`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    
    return response.json();
  }
}

export const authService = new AuthService();