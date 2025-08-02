import type { AppProps } from 'next/app';
import { Provider as JotaiProvider } from 'jotai';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import '@/ui/styles/global.css';
import '@/ui/styles/kdramaTheme.css';
import { 
  authStateAtom, 
  handleOAuthCallbackAtom, 
  shouldRefreshTokenAtom,
  isTokenExpiredAtom 
} from '@/domain/auth';
import { tokenManager } from '@/domain/auth/tokenManager';

/**
 * Authentication initialization component
 * Handles OAuth callbacks and token refresh logic
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useAtom(authStateAtom);
  const setHandleOAuthCallback = useAtom(handleOAuthCallbackAtom)[1];
  const shouldRefresh = useAtomValue(shouldRefreshTokenAtom);
  const isExpired = useAtomValue(isTokenExpiredAtom);

  // Handle OAuth callback on mount
  useEffect(() => {
    const { code, state, error, error_description } = router.query;
    
    if (code && state && router.pathname === '/auth/callback') {
      console.info('Auth Initialization', {
        action: 'oauth_callback_detected',
        state: state as string,
        hasError: !!error,
        timestamp: new Date().toISOString()
      });

      setHandleOAuthCallback({ 
        isCallback: true, 
        callbackError: error ? `${error}: ${error_description || 'OAuth error'}` : undefined 
      });
    }
  }, [router.query, router.pathname, setHandleOAuthCallback]);

  // Initialize token validation on app load
  useEffect(() => {
    if (authState.accessToken && !authState.user) {
      const validation = tokenManager.validateToken(authState.accessToken);
      
      if (validation.payload) {
        console.info('Auth Initialization', {
          action: 'token_validated_on_load',
          userId: validation.payload.sub,
          expiresIn: validation.expiresIn,
          timestamp: new Date().toISOString()
        });

        // Update auth state with token info if we don't have user data
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: validation.isValid && !validation.isExpired,
          tokenExpiresAt: validation.payload!.exp * 1000,
          error: validation.isExpired ? {
            code: 6, // AUTH_ERROR_SESSION_EXPIRED
            message: 'Session expired',
            timestamp: Date.now()
          } : null
        }));
      }
    }
  }, [authState.accessToken, authState.user, setAuthState]);

  // Log authentication state changes for debugging
  useEffect(() => {
    console.debug('Auth State Change', {
      isAuthenticated: authState.isAuthenticated,
      hasUser: !!authState.user,
      hasToken: !!authState.accessToken,
      isLoading: authState.isLoading,
      hasError: !!authState.error,
      shouldRefresh,
      isExpired,
      timestamp: new Date().toISOString()
    });
  }, [authState, shouldRefresh, isExpired]);

  // Handle session recovery from stored return URL
  useEffect(() => {
    if (authState.isAuthenticated && typeof window !== 'undefined') {
      const returnUrl = sessionStorage.getItem('auth_return_url');
      if (returnUrl && returnUrl !== router.asPath) {
        console.info('Auth Initialization', {
          action: 'redirecting_to_return_url',
          returnUrl,
          currentPath: router.asPath,
          timestamp: new Date().toISOString()
        });
        
        sessionStorage.removeItem('auth_return_url');
        router.push(returnUrl);
      }
    }
  }, [authState.isAuthenticated, router]);

  return <>{children}</>;
}

/**
 * Main App component with authentication providers
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <JotaiProvider>
      <AuthInitializer>
        <Component {...pageProps} />
      </AuthInitializer>
    </JotaiProvider>
  );
}