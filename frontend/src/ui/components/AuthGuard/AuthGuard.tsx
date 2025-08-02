import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthGuardProps, AuthState } from '../../../types/auth';
import { Loading } from '../Loading';
import { GoogleLoginButton } from '../GoogleLoginButton';
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
    isLoading: true,
    error: null,
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
              email: 'user@example.com',
              name: 'Test User',
              picture: 'https://via.placeholder.com/96x96',
            },
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth Check Error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          component: 'AuthGuard',
          timestamp: new Date().toISOString(),
        });
        
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
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
      console.info('Auth Guard Redirect', {
        action: 'redirect_to_login',
        component: 'AuthGuard',
        redirectTo,
        currentPath: router.asPath,
        timestamp: new Date().toISOString(),
      });
      
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
          <p className={fallbackDescription}>{error}</p>
          <GoogleLoginButton
            text="Try Again"
            size="lg"
            onSuccess={(response) => {
              console.info('Auth Guard Login Success', {
                action: 'login_success_from_guard',
                component: 'AuthGuard',
                userId: response.user.id,
                timestamp: new Date().toISOString(),
              });
              
              // Store token and refresh auth state
              if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', response.accessToken);
                window.location.reload();
              }
            }}
            onError={(error) => {
              console.error('Auth Guard Login Error', {
                error: error.message,
                code: error.code,
                component: 'AuthGuard',
                timestamp: new Date().toISOString(),
              });
            }}
          />
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
            You need to be signed in to access this content. Please sign in with your Google account to continue.
          </p>
          <GoogleLoginButton
            text="Sign in with Google"
            size="lg"
            onSuccess={(response) => {
              console.info('Auth Guard Login Success', {
                action: 'login_success_from_guard',
                component: 'AuthGuard',
                userId: response.user.id,
                timestamp: new Date().toISOString(),
              });
              
              // Store token and refresh auth state
              if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', response.accessToken);
                window.location.reload();
              }
            }}
            onError={(error) => {
              console.error('Auth Guard Login Error', {
                error: error.message,
                code: error.code,
                component: 'AuthGuard',
                timestamp: new Date().toISOString(),
              });
            }}
          />
        </div>
      </div>
    );
  }

  // User is authenticated, render protected content
  console.debug('Auth Guard Success', {
    action: 'render_protected_content',
    component: 'AuthGuard',
    userId: user?.id,
    userEmail: user?.email,
    timestamp: new Date().toISOString(),
  });

  return <>{children}</>;
};