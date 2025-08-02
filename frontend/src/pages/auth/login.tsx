import React from 'react';
import { useRouter } from 'next/router';
import { GoogleLoginButton } from '@/domain/auth/components';
import * as styles from '@/ui/styles/Auth.css';

/**
 * Login page with Google OAuth
 */
export default function LoginPage() {
  const router = useRouter();
  const { error, returnUrl } = router.query;

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <strong>Authentication Error:</strong> {' '}
            {error === 'invalid_callback' 
              ? 'Invalid authentication callback. Please try signing in again.'
              : decodeURIComponent(error as string)
            }
          </div>
        )}

        <div className={styles.loginSection}>
          <GoogleLoginButton
            variant="full-width"
            text="Continue with Google"
            redirectUri={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback${
              returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl as string)}` : ''
            }`}
          />
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            By signing in, you agree to our{' '}
            <a href="/terms" className={styles.link}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className={styles.link}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}