import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks';
import { GoogleLoginButton } from './GoogleLoginButton';
import * as styles from './ProtectedRoute.css';

interface ProtectedRouteProps {
  /** Child components to render when authenticated */
  children: React.ReactNode;
  /** Redirect URL after successful authentication */
  redirectPath?: string;
  /** Whether to show login prompt or redirect immediately */
  showLoginPrompt?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom unauthorized component */
  unauthorizedComponent?: React.ReactNode;
  /** Minimum roles required (future extensibility) */
  requiredRoles?: string[];
  /** Whether to allow access during token refresh */
  allowDuringRefresh?: boolean;
}

/**
 * ProtectedRoute component that handles authentication checks and redirects
 * Shows loading states, login prompts, and handles token refresh scenarios
 */
export function ProtectedRoute({
  children,
  redirectPath,
  showLoginPrompt = true,
  loadingComponent,
  unauthorizedComponent,
  requiredRoles = [],
  allowDuringRefresh = true
}: ProtectedRouteProps) {
  const router = useRouter();
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    user, 
    tokenValidation,
    shouldRefresh,
    refreshAccessToken 
  } = useAuth();
  
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Store the intended URL for redirect after login
  useEffect(() => {
    if (!isAuthenticated && !isLoading && typeof window !== 'undefined') {
      const returnUrl = router.asPath;
      if (returnUrl && returnUrl !== '/') {
        console.debug('Protected Route', {
          action: 'store_return_url',
          returnUrl,
          currentPath: router.asPath,
          timestamp: new Date().toISOString()
        });
        
        // Store in sessionStorage for retrieval after login
        sessionStorage.setItem('auth_return_url', returnUrl);
      }
    }
  }, [isAuthenticated, isLoading, router.asPath]);

  // Handle token refresh if needed
  useEffect(() => {
    const attemptRefresh = async () => {
      if (shouldRefresh && !hasAttemptedRefresh && !isRefreshing) {
        setIsRefreshing(true);
        setHasAttemptedRefresh(true);
        
        console.info('Protected Route', {
          action: 'attempting_token_refresh',
          userId: user?.id,
          expiresIn: tokenValidation.expiresIn,
          timestamp: new Date().toISOString()
        });

        try {
          const success = await refreshAccessToken();
          if (!success) {
            console.warn('Protected Route', {
              action: 'token_refresh_failed',
              userId: user?.id,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Protected Route', {
            action: 'token_refresh_error',
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: user?.id,
            timestamp: new Date().toISOString()
          });
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    attemptRefresh();
  }, [shouldRefresh, hasAttemptedRefresh, isRefreshing, refreshAccessToken, user?.id, tokenValidation.expiresIn]);

  // Reset refresh attempt when user changes or becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setHasAttemptedRefresh(false);
    }
  }, [isAuthenticated, user?.id]);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!showLoginPrompt && !isAuthenticated && !isLoading && !isRefreshing) {
      const loginUrl = redirectPath || '/auth/login';
      const returnUrl = router.asPath;
      
      console.info('Protected Route', {
        action: 'redirecting_to_login',
        loginUrl,
        returnUrl,
        timestamp: new Date().toISOString()
      });
      
      router.push(`${loginUrl}?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isAuthenticated, isLoading, isRefreshing, showLoginPrompt, redirectPath, router]);

  // Show loading state
  if (isLoading || isRefreshing) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <h2 className={styles.loadingText}>
            {isRefreshing ? 'Refreshing session...' : 'Loading...'}
          </h2>
          <p className={styles.loadingSubtext}>
            {isRefreshing 
              ? 'Please wait while we refresh your authentication.'
              : 'Please wait while we verify your authentication.'
            }
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <ErrorIcon />
          <h2 className={styles.errorTitle}>Authentication Error</h2>
          <p className={styles.errorMessage}>
            {error.message || 'There was a problem with authentication. Please try again.'}
          </p>
          <div className={styles.errorActions}>
            <button 
              className={styles.retryButton}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
            >
              Retry
            </button>
            <Link href="/" className={styles.alternativeLink}>
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    if (showLoginPrompt) {
      return (
        <div className={styles.container}>
          <div className={styles.loginPromptContainer}>
            <h1 className={styles.loginPromptTitle}>Sign in required</h1>
            <p className={styles.loginPromptSubtitle}>
              You need to sign in to access this page. We&apos;ll bring you right back here after you sign in.
            </p>
            <div className={styles.loginPromptActions}>
              <GoogleLoginButton 
                variant="full-width"
                text="Sign in to continue"
                redirectUri={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
              />
              <Link href="/" className={styles.alternativeLink}>
                Go to Home instead
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return null; // Don't render anything if redirecting
  }

  // Check role requirements (future extensibility)
  if (requiredRoles.length > 0 && user) {
    // This would check user roles against required roles
    // For now, we'll just log the requirement
    console.debug('Protected Route', {
      action: 'role_check',
      requiredRoles,
      userId: user.id,
      message: 'Role checking not yet implemented',
      timestamp: new Date().toISOString()
    });
  }

  // Show authenticated content
  console.debug('Protected Route', {
    action: 'rendering_protected_content',
    userId: user?.id,
    email: user?.email,
    timestamp: new Date().toISOString()
  });

  return <>{children}</>;
}

/**
 * Error icon component
 */
function ErrorIcon() {
  return (
    <svg 
      className={styles.errorIcon}
      fill="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}

/**
 * Higher-order component version of ProtectedRoute
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}