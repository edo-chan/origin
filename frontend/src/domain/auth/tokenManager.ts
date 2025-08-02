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
        console.warn('JWT Token', {
          action: 'parse_token_failed',
          reason: 'invalid_format',
          partsCount: parts.length,
          timestamp: new Date().toISOString()
        });
        return null;
      }

      // Decode base64url payload
      const payload = parts[1];
      const decoded = this.base64UrlDecode(payload);
      const parsed = JSON.parse(decoded);

      console.debug('JWT Token', {
        action: 'token_parsed',
        userId: parsed.sub,
        expiresAt: new Date(parsed.exp * 1000).toISOString(),
        issuedAt: new Date(parsed.iat * 1000).toISOString(),
        timestamp: new Date().toISOString()
      });

      return parsed as JWTPayload;
    } catch (error) {
      console.error('JWT Token', {
        action: 'parse_token_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
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
      console.info('JWT Token', {
        action: 'token_validation',
        result: 'expired',
        userId: payload.sub,
        expiredAt: new Date(payload.exp * 1000).toISOString(),
        timestamp: new Date().toISOString()
      });
    } else {
      console.debug('JWT Token', {
        action: 'token_validation',
        result: 'valid',
        userId: payload.sub,
        expiresIn: Math.floor(expiresIn),
        timestamp: new Date().toISOString()
      });
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
    
    if (shouldRefresh) {
      console.info('JWT Token', {
        action: 'should_refresh_token',
        result: true,
        expiresIn: validation.expiresIn,
        threshold: this.refreshConfig.refreshThresholdSeconds,
        userId: validation.payload.sub,
        timestamp: new Date().toISOString()
      });
    }

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
      console.debug('JWT Token', {
        action: 'refresh_token_deduplicated',
        message: 'Using existing refresh promise',
        timestamp: new Date().toISOString()
      });
      return this.refreshPromise;
    }

    const requestId = generateUUID();
    
    console.info('JWT Token', {
      action: 'refresh_token_start',
      requestId,
      timestamp: new Date().toISOString()
    });

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
        console.debug('JWT Token', {
          action: 'refresh_token_attempt',
          requestId,
          attempt,
          maxRetries: this.refreshConfig.maxRetries,
          timestamp: new Date().toISOString()
        });

        const response = await refreshFunction(refreshToken);
        
        console.info('JWT Token', {
          action: 'refresh_token_success',
          requestId,
          attempt,
          newExpiresAt: new Date(response.expiresAt * 1000).toISOString(),
          hasNewRefreshToken: !!response.refreshToken,
          timestamp: new Date().toISOString()
        });

        // Schedule next refresh if auto-refresh is enabled
        if (this.refreshConfig.autoRefresh) {
          this.scheduleTokenRefresh(response.accessToken, refreshToken, refreshFunction);
        }

        return response.accessToken;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown refresh error');
        
        console.warn('JWT Token', {
          action: 'refresh_token_attempt_failed',
          requestId,
          attempt,
          error: lastError.message,
          willRetry: attempt < this.refreshConfig.maxRetries,
          timestamp: new Date().toISOString()
        });

        if (attempt < this.refreshConfig.maxRetries) {
          const delay = this.refreshConfig.retryDelayMs * attempt; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('JWT Token', {
      action: 'refresh_token_failed',
      requestId,
      error: lastError?.message || 'Unknown error',
      attemptsExhausted: this.refreshConfig.maxRetries,
      timestamp: new Date().toISOString()
    });

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

    console.debug('JWT Token', {
      action: 'schedule_token_refresh',
      delaySeconds: Math.floor(delayMs / 1000),
      refreshAt: new Date(Date.now() + delayMs).toISOString(),
      timestamp: new Date().toISOString()
    });

    this.refreshTimer = setTimeout(() => {
      this.refreshToken(refreshToken, refreshFunction).catch(error => {
        console.error('JWT Token', {
          action: 'scheduled_refresh_failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
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
      
      console.debug('JWT Token', {
        action: 'scheduled_refresh_cleared',
        timestamp: new Date().toISOString()
      });
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