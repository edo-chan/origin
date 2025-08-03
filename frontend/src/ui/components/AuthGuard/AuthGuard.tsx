import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthState, AuthErrorCode } from '../../../domain/auth/atoms';

// AuthGuard component props interface
export interface AuthGuardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  showLoading?: boolean;
}
import { Loading } from '../Loading';
import {
  authGuardContainer,
  loadingContainer,
  fallbackContainer,
  loadingText,
  fallbackTitle,
  fallbackDescription,
} from './AuthGuard.css';

// Mock authentication state - replace with actual auth context/hook
const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    session: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    error: null,
    lastActivity: Date.now(),
    tokenExpiresAt: null,
  });

  useEffect(() => {
    // Mock authentication check - replace with actual auth logic
    const checkAuth = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for existing token/session
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Validate token with backend
          setAuthState({
            isAuthenticated: true,
            user: {
              id: 'mock-user-id',
              googleId: 'google123',
              email: 'user@example.com',
              name: 'Test User',
              pictureUrl: 'https://via.placeholder.com/96x96',
              isActive: true,
              isVerified: true,
              createdAt: BigInt(Date.now()),
              updatedAt: BigInt(Date.now()),
              preferences: '{}',
            },
            session: null,
            accessToken: 'mock-token',
            refreshToken: null,
            isLoading: false,
            error: null,
            lastActivity: Date.now(),
            tokenExpiresAt: Date.now() + 3600000,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            session: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null,
            lastActivity: Date.now(),
            tokenExpiresAt: null,
          });
        }
      } catch (error) {
        
        setAuthState({
          isAuthenticated: false,
          user: null,
          session: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
          error: error instanceof Error ? {
            code: AuthErrorCode.UNKNOWN,
            message: error.message,
            timestamp: Date.now(),
          } : {
            code: AuthErrorCode.UNKNOWN,
            message: 'Authentication failed',
            timestamp: Date.now(),
          },
          lastActivity: Date.now(),
          tokenExpiresAt: null,
        });
      }
    };

    checkAuth();
  }, []);

  return authState;
};

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  redirectTo,
  showLoading = true,
  ...props
}) => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, error } = useAuth();

  // Handle redirect to login page
  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  // Show loading state
  if (isLoading && showLoading) {
    return (
      <div className={authGuardContainer}>
        <div className={loadingContainer}>
          <Loading type="spinner" variant="primary" size="lg" />
          <p className={loadingText}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !isAuthenticated) {
    return (
      <div className={authGuardContainer}>
        <div className={fallbackContainer}>
          <h2 className={fallbackTitle}>Authentication Error</h2>
          <p className={fallbackDescription}>{typeof error === 'string' ? error : error.message}</p>
          <p>Please refresh the page or go to the login page.</p>
        </div>
      </div>
    );
  }

  // User is not authenticated
  if (!isAuthenticated) {
    // If redirectTo is specified, don't render anything (let redirect handle it)
    if (redirectTo) {
      return null;
    }

    // Show custom fallback or default login prompt
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={authGuardContainer}>
        <div className={fallbackContainer}>
          <h2 className={fallbackTitle}>Sign in Required</h2>
          <p className={fallbackDescription}>
            You need to be signed in to access this content. Please go to the login page to continue.
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};