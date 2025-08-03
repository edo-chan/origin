import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks';
import { OtpLoginForm } from '@/domain/otp';
import { Stack } from '@/ui/components/Stack';
import { Text } from '@/ui/components/Text';
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
      const loginUrl = redirectPath || '/auth/otp';
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
      <Stack className={styles.container}>
        <Stack className={styles.loadingContainer} gap="md">
          <div className={styles.loadingSpinner} />
          <Text as="h2" variant="primary" size="lg" className={styles.loadingText}>
            {isRefreshing ? "Refreshing session..." : "Loading..."}
          </Text>
          <Text variant="secondary" className={styles.loadingSubtext}>
            {isRefreshing 
              ? "Please wait while we refresh your authentication."
              : "Please wait while we verify your authentication."
            }
          </Text>
        </Stack>
      </Stack>
    );
  }

  // Show error state
  if (error && !isAuthenticated) {
    return (
      <Stack className={styles.container}>
        <Stack className={styles.errorContainer} gap="md">
          <ErrorIcon />
          <Text as="h2" variant="primary" size="lg" className={styles.errorTitle}>
            {"Authentication Error"}
          </Text>
          <Text variant="secondary" className={styles.errorMessage}>
            {error.message || "There was a problem with authentication. Please try again."}
          </Text>
          <Stack className={styles.errorActions} gap="sm">
            <button 
              className={styles.retryButton}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
            >
              {"Retry"}
            </button>
            <Link href="/" className={styles.alternativeLink}>
              {"Go to Home"}
            </Link>
          </Stack>
        </Stack>
      </Stack>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    if (showLoginPrompt) {
      return (
        <Stack className={styles.container}>
          <Stack className={styles.loginPromptContainer} gap="lg">
            <Text as="h2" variant="primary" size="xl" className={styles.loginPromptTitle}>
              {"Sign in required"}
            </Text>
            <Text variant="secondary" className={styles.loginPromptSubtitle}>
              {"You need to sign in to access this page. We'll bring you right back here after you sign in."}
            </Text>
            <Stack className={styles.loginPromptActions} gap="md">
              <OtpLoginForm />
              <Link href="/" className={styles.alternativeLink}>
                {"Go to Home instead"}
              </Link>
            </Stack>
          </Stack>
        </Stack>
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