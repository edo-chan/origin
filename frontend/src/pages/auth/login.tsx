import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Stack } from '@/ui/components/Stack';
import { Text } from '@/ui/components/Text';
import * as styles from '@/ui/styles/Auth.css';

/**
 * Deprecated login page - redirects to OTP login
 */
export default function LoginPage() {
  const router = useRouter();
  const { error, returnUrl } = router.query;

  return (
    <Stack className={styles.container}>
      <Stack className={styles.loginCard} gap="lg">
        <Stack className={styles.header} gap="sm">
          <Text as="h1" variant="primary" size="xl" className={styles.title}>
            {"Login Method Changed"}
          </Text>
          <Text variant="secondary" className={styles.subtitle}>
            {"We've updated our authentication system"}
          </Text>
        </Stack>

        {error && (
          <Stack className={styles.errorAlert} gap="none">
            <Text variant="secondary" size="sm">
              <strong>{"Authentication Error:"}</strong>{" "}
              {error === 'invalid_callback' 
                ? "Invalid authentication callback. Please try signing in again."
                : decodeURIComponent(error as string)
              }
            </Text>
          </Stack>
        )}

        <Stack className={styles.loginSection} gap="md">
          <Text variant="secondary" className={styles.subtitle} style={{ marginBottom: '2rem' }}>
            {"This login method has been deprecated. Please use our new email-based authentication."}
          </Text>
          <Link 
            href={`/auth/otp${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl as string)}` : ''}`}
            className={styles.button}
            style={{ 
              display: 'inline-block', 
              textAlign: 'center',
              width: '100%',
              textDecoration: 'none'
            }}
          >
            {"Go to Email Login"}
          </Link>
        </Stack>

        <Stack className={styles.footer}>
          <Text variant="secondary" size="sm" className={styles.footerText}>
            {"By signing in, you agree to our "}
            <a href="/terms" className={styles.link}>{"Terms of Service"}</a>
            {" and "}
            <a href="/privacy" className={styles.link}>{"Privacy Policy"}</a>
            {"."}
          </Text>
        </Stack>
      </Stack>
    </Stack>
  );
}