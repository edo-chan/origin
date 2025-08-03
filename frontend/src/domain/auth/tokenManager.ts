/**
 * JWT Token Management Utilities
 * Handles token storage, validation, parsing, and refresh logic
 */

import { generateUUID } from '@/utils/uuid';

// JWT payload interface for type safety
export interface JWTPayload {
  sub: string;      // Subject (user ID)
  email: string;    // User email
  name: string;     // User name
  iat: number;      // Issued at (Unix timestamp)
  exp: number;      // Expires at (Unix timestamp)
  aud: string;      // Audience
  iss: string;      // Issuer
  jti: string;      // JWT ID
  scope?: string;   // OAuth scopes
  session_id?: string; // Session identifier
}

// Token validation result
export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload: JWTPayload | null;
  error?: string;
  expiresIn?: number; // Seconds until expiration
}

// Token refresh configuration
export interface TokenRefreshConfig {
  refreshThresholdSeconds: number; // Refresh token when this close to expiry
  maxRetries: number;
  retryDelayMs: number;
  autoRefresh: boolean;
}

// Default configuration
const DEFAULT_REFRESH_CONFIG: TokenRefreshConfig = {
  refreshThresholdSeconds: 300, // 5 minutes
  maxRetries: 3,
  retryDelayMs: 1000,
  autoRefresh: true,
};

/**
 * TokenManager class for handling JWT operations
 */
export class TokenManager {
  private refreshConfig: TokenRefreshConfig;
  private refreshPromise: Promise<string | null> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<TokenRefreshConfig> = {}) {
    this.refreshConfig = { ...DEFAULT_REFRESH_CONFIG, ...config };
  }

  /**
   * Parse JWT token without verification (for client-side inspection)
   * Note: This is for UI purposes only. Server must always verify tokens.
   */
  parseToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode base64url payload
      const payload = parts[1];
      const decoded = this.base64UrlDecode(payload);
      const parsed = JSON.parse(decoded);

      return parsed as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate JWT token (client-side checks only)
   */
  validateToken(token: string | null): TokenValidationResult {
    if (!token) {
      return {
        isValid: false,
        isExpired: false,
        payload: null,
        error: 'No token provided'
      };
    }

    const payload = this.parseToken(token);
    if (!payload) {
      return {
        isValid: false,
        isExpired: false,
        payload: null,
        error: 'Invalid token format'
      };
    }

    const now = Date.now() / 1000; // Convert to Unix timestamp
    const isExpired = payload.exp <= now;
    const expiresIn = Math.max(0, payload.exp - now);

    const result: TokenValidationResult = {
      isValid: !isExpired,
      isExpired,
      payload,
      expiresIn: Math.floor(expiresIn)
    };

    if (isExpired) {
      result.error = 'Token expired';
    }

    return result;
  }

  /**
   * Check if token needs refresh based on expiration time
   */
  shouldRefreshToken(token: string | null): boolean {
    if (!token) return false;

    const validation = this.validateToken(token);
    if (!validation.payload) return false;

    const shouldRefresh = (validation.expiresIn || 0) <= this.refreshConfig.refreshThresholdSeconds;
    
    return shouldRefresh;
  }

  /**
   * Refresh token with retry logic and deduplication
   */
  async refreshToken(
    refreshToken: string,
    refreshFunction: (token: string) => Promise<{ accessToken: string; refreshToken?: string; expiresAt: number }>
  ): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const requestId = generateUUID();
    
    this.refreshPromise = this.performTokenRefresh(refreshToken, refreshFunction, requestId);
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Internal method to perform token refresh with retries
   */
  private async performTokenRefresh(
    refreshToken: string,
    refreshFunction: (token: string) => Promise<{ accessToken: string; refreshToken?: string; expiresAt: number }>,
    requestId: string
  ): Promise<string | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.refreshConfig.maxRetries; attempt++) {
      try {
        const response = await refreshFunction(refreshToken);

        // Schedule next refresh if auto-refresh is enabled
        if (this.refreshConfig.autoRefresh) {
          this.scheduleTokenRefresh(response.accessToken, refreshToken, refreshFunction);
        }

        return response.accessToken;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown refresh error');

        if (attempt < this.refreshConfig.maxRetries) {
          const delay = this.refreshConfig.retryDelayMs * attempt; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return null;
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(
    accessToken: string,
    refreshToken: string,
    refreshFunction: (token: string) => Promise<{ accessToken: string; refreshToken?: string; expiresAt: number }>
  ): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    const validation = this.validateToken(accessToken);
    if (!validation.payload || validation.isExpired) return;

    const delayMs = Math.max(
      0,
      (validation.expiresIn! - this.refreshConfig.refreshThresholdSeconds) * 1000
    );


    this.refreshTimer = setTimeout(() => {
      this.refreshToken(refreshToken, refreshFunction).catch(() => {
        // Silently handle scheduled refresh failures
      });
    }, delayMs);
  }

  /**
   * Clear any scheduled refresh
   */
  clearScheduledRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Extract user information from token for UI display
   */
  getUserFromToken(token: string | null): { id: string; email: string; name: string } | null {
    if (!token) return null;

    const payload = this.parseToken(token);
    if (!payload) return null;

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    };
  }

  /**
   * Base64URL decode (RFC 4648)
   */
  private base64UrlDecode(str: string): string {
    // Replace URL-safe characters with standard base64 characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if necessary
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decode and convert to UTF-8
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.clearScheduledRefresh();
    this.refreshPromise = null;
  }
}

// Default token manager instance
export const tokenManager = new TokenManager();

// Utility functions for common operations
export const parseJWTToken = (token: string): JWTPayload | null => tokenManager.parseToken(token);
export const validateJWTToken = (token: string): TokenValidationResult => tokenManager.validateToken(token);
export const shouldRefreshJWTToken = (token: string): boolean => tokenManager.shouldRefreshToken(token);
export const getUserFromJWTToken = (token: string): { id: string; email: string; name: string } | null => 
  tokenManager.getUserFromToken(token);

// Token interface for setTokens function
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

// Placeholder setTokens function for backward compatibility
// This should be implemented using auth atoms in the actual application
export const setTokens = (tokens: TokenData): void => {
  // This is a placeholder - in a real implementation, this would use
  // the auth atoms (updateTokensAtom) to set the tokens
  console.warn('setTokens called - this should be replaced with proper auth state management');
  console.log('Tokens to set:', tokens);
};