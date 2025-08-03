import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { OtpLoginForm } from '@/domain/otp/components';
import { Stack } from '@/ui/components/Stack';
import { Text } from '@/ui/components/Text';
import * as styles from '@/ui/styles/Auth.css';

/**
 * OTP Login page - primary authentication method
 */
export default function OtpLoginPage() {
  const router = useRouter();
  const { error, returnUrl } = router.query;

  return (
    <>
      <Head>
        <title>Sign In - Template App</title>
        <meta name="description" content="Sign in to your account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Stack className={styles.container}>
        <Stack className={styles.loginCard} gap="lg">
          <Stack className={styles.header} gap="sm">
            <Text as="h1" variant="primary" size="xl" className={styles.title}>
              {"Welcome"}
            </Text>
            <Text variant="secondary" className={styles.subtitle}>
              {"Sign in to your account to continue"}
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

          <Stack className={styles.loginSection}>
            <OtpLoginForm 
              redirectTo={returnUrl ? decodeURIComponent(returnUrl as string) : '/dashboard'}
            />
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
    </>
  );
}