import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/domain/auth';

/**
 * OAuth callback page
 * Handles the OAuth callback flow and redirects appropriately
 */
export default function AuthCallback() {
  const router = useRouter();
  const { handleCallback, isLoading, error } = useAuth();

  useEffect(() => {
    const { code, state, error: oauthError, error_description } = router.query;

    if (oauthError) {
      console.error('OAuth Callback Error', {
        error: oauthError,
        description: error_description,
        timestamp: new Date().toISOString()
      });
      
      // Redirect to login with error
      router.push(`/auth/login?error=${encodeURIComponent(oauthError as string)}`);
      return;
    }

    if (code && state) {
      handleCallback(code as string, state as string);
    } else if (router.isReady) {
      // Missing required parameters
      console.error('OAuth Callback Missing Parameters', {
        hasCode: !!code,
        hasState: !!state,
        query: router.query,
        timestamp: new Date().toISOString()
      });
      
      router.push('/auth/login?error=invalid_callback');
    }
  }, [router.query, router.isReady, handleCallback, router]);

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1>Authentication Error</h1>
        <p>{error.message}</p>
        <button onClick={() => router.push('/auth/login')}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #4285f4',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }} />
      <h2>Completing sign in...</h2>
      <p>Please wait while we finish setting up your account.</p>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}