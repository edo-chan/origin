import { useCallback, useEffect, useMemo } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/router';
import {
  authStateAtom,
  refreshTokenAtom,
  googleOAuthStateAtom,
  userAtom,
  accessTokenAtom,
  isAuthenticatedAtom,
  isLoadingAtom,
  authErrorAtom,
  loginSuccessAtom,
  logoutAtom,
  updateTokensAtom,
  initializeOAuthAtom,
  handleOAuthCallbackAtom,
  shouldRefreshTokenAtom,
  isTokenExpiredAtom,
  type AuthError
} from './atoms';
import { tokenManager, type TokenValidationResult } from './tokenManager';
import * as authActions from './action';
import type { 
  InitiateOAuthRequest,
  CompleteOAuthRequest,
  RefreshTokenRequest,
  UserProfile
} from '@/proto/auth';

// Type aliases for backward compatibility
type HandleOAuthCallbackRequest = CompleteOAuthRequest;
type User = UserProfile;

// Mock type for UpdateUserProfileRequest (not in current proto)
interface UpdateUserProfileRequest {
  name?: string;
  givenName?: string;
  familyName?: string;
  pictureUrl?: string;
  locale?: string;
  preferences?: string;
}
import { generateUUID } from '../../utils/uuid';

/**
 * Main authentication hook - provides all auth state and operations
 */
export function useAuth() {
  const [authState, setAuthState] = useAtom(authStateAtom);
  const [refreshToken, setRefreshToken] = useAtom(refreshTokenAtom);
  const [oauthState, setOAuthState] = useAtom(googleOAuthStateAtom);
  
  const setLoginSuccess = useSetAtom(loginSuccessAtom);
  const setLogout = useSetAtom(logoutAtom);
  const setUpdateTokens = useSetAtom(updateTokensAtom);
  const setInitializeOAuth = useSetAtom(initializeOAuthAtom);
  const setHandleOAuthCallback = useSetAtom(handleOAuthCallbackAtom);
  
  const router = useRouter();

  // Check if tokens need refresh
  const shouldRefresh = useAtomValue(shouldRefreshTokenAtom);
  const isExpired = useAtomValue(isTokenExpiredAtom);

  /**
   * Initiate Google OAuth flow
   */
  const login = useCallback(async (redirectUri?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const request: InitiateOAuthRequest = {
        redirectUri: redirectUri || `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        deviceName: typeof navigator !== 'undefined' ? `${navigator.platform} - ${navigator.userAgent.split(' ')[0]}` : 'Unknown Device'
      };

      const response = await authActions.initiateOAuth(request);
      
      setInitializeOAuth({
        authorizationUrl: response.authUrl,
        state: response.stateToken,
        codeChallenge: '' // Not provided by current proto
      });

      // Redirect to Google OAuth
      if (typeof window !== 'undefined') {
        window.location.href = response.authUrl;
      }
      
    } catch (error) {
      const authError: AuthError = {
        code: 10, // AUTH_ERROR_OAUTH_SERVICE_ERROR
        message: error instanceof Error ? error.message : 'OAuth initialization failed',
        timestamp: Date.now(),
        requestId: generateUUID()
      };

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError
      }));
    }
  }, [setAuthState, setInitializeOAuth]);

  /**
   * Handle OAuth callback (typically called from callback page)
   */
  const handleCallback = useCallback(async (code: string, state: string) => {
    try {
      setHandleOAuthCallback({ isCallback: true });
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const deviceInfo = {
        browser: navigator.userAgent.split(')')[0].split('(')[1] || 'Unknown',
        os: navigator.platform || 'Unknown',
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        fingerprint: generateUUID()
      };

      const request: HandleOAuthCallbackRequest = {
        code,
        state,
        deviceInfo: JSON.stringify(deviceInfo),
        userAgent: navigator.userAgent
      };

      const response = await authActions.completeOAuth(request);
      setLoginSuccess(response);

      // Redirect to intended page or dashboard
      const returnUrl = router.query.returnUrl as string || '/dashboard';
      await router.push(returnUrl);

    } catch (error) {
      const authError: AuthError = {
        code: 2, // AUTH_ERROR_INVALID_CODE
        message: error instanceof Error ? error.message : 'OAuth callback failed',
        timestamp: Date.now(),
        requestId: generateUUID()
      };

      setHandleOAuthCallback({ 
        isCallback: true, 
        callbackError: authError.message 
      });

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError
      }));
    }
  }, [setAuthState, setHandleOAuthCallback, setLoginSuccess, router]);

  /**
   * Refresh access token using refresh token
   */
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      return false;
    }

    try {
      const newToken = await tokenManager.refreshToken(refreshToken, async (token) => {
        const request: RefreshTokenRequest = {
          refreshToken: token
        };

        const response = await authActions.refreshToken(request);
        return {
          accessToken: response.accessToken,
          refreshToken: token, // Use the existing refresh token
          expiresAt: Number(response.accessTokenExpiresAt)
        };
      });

      if (newToken) {
        const validation = tokenManager.validateToken(newToken);
        if (validation.payload) {
          setUpdateTokens({
            accessToken: newToken,
            expiresAt: validation.payload.exp
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      // If refresh fails, logout user
      setLogout('refresh_failed');
      return false;
    }
  }, [refreshToken, setUpdateTokens, setLogout]);

  /**
   * Logout user and clear all authentication data
   */
  const logout = useCallback(async (allDevices = false) => {
    try {
      if (authState.accessToken) {
        await authActions.logout({
          accessToken: authState.accessToken
        });
      }
    } catch (error) {
      // Silently handle logout API failures
    } finally {
      setLogout('user_initiated');
      await router.push('/');
    }
  }, [authState.accessToken, setLogout, router]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: Partial<UpdateUserProfileRequest>) => {
    if (!authState.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // TODO: Implement profile update when backend API is available
      throw new Error('Profile update not implemented');
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: {
          code: 9, // AUTH_ERROR_INVALID_REQUEST
          message: error instanceof Error ? error.message : 'Profile update failed',
          timestamp: Date.now()
        }
      }));
      throw error;
    }
  }, [authState.accessToken, setAuthState]);

  /**
   * Auto-refresh token when needed
   */
  useEffect(() => {
    if (shouldRefresh && !authState.isLoading) {
      refreshAccessToken();
    }
  }, [shouldRefresh, authState.isLoading, refreshAccessToken]);

  /**
   * Handle expired tokens
   */
  useEffect(() => {
    if (isExpired && authState.isAuthenticated) {
      if (refreshToken) {
        refreshAccessToken();
      } else {
        setLogout('token_expired');
      }
    }
  }, [isExpired, authState.isAuthenticated, authState.user?.id, refreshToken, refreshAccessToken, setLogout]);

  return {
    // State
    user: authState.user,
    session: authState.session,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    oauthState,
    
    // Token info
    tokenValidation: useMemo(() => 
      tokenManager.validateToken(authState.accessToken), 
      [authState.accessToken]
    ),
    shouldRefresh,
    isExpired,
    
    // Actions
    login,
    logout,
    handleCallback,
    refreshAccessToken,
    updateProfile,
    
    // Utilities
    clearError: useCallback(() => {
      setAuthState(prev => ({ ...prev, error: null }));
    }, [setAuthState])
  };
}

/**
 * Hook for accessing current user information
 */
export function useUser() {
  const user = useAtomValue(userAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  
  return {
    user,
    isAuthenticated,
    isLoading: false // User info is synchronous from atoms
  };
}

/**
 * Hook for accessing authentication status
 */
export function useAuthStatus() {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const isLoading = useAtomValue(isLoadingAtom);
  const error = useAtomValue(authErrorAtom);
  
  return {
    isAuthenticated,
    isLoading,
    error
  };
}

/**
 * Hook for token operations
 */
export function useToken() {
  const accessToken = useAtomValue(accessTokenAtom);
  const refreshToken = useAtomValue(refreshTokenAtom);
  const shouldRefresh = useAtomValue(shouldRefreshTokenAtom);
  const isExpired = useAtomValue(isTokenExpiredAtom);
  
  const validation = useMemo(() => 
    tokenManager.validateToken(accessToken), 
    [accessToken]
  );
  
  return {
    accessToken,
    hasRefreshToken: !!refreshToken,
    validation,
    shouldRefresh,
    isExpired,
    expiresIn: validation.expiresIn || 0,
    userInfo: validation.payload ? {
      id: validation.payload.sub,
      email: validation.payload.email,
      name: validation.payload.name
    } : null
  };
}