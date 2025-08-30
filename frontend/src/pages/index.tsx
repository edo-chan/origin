import Head from 'next/head';
import React, { useState } from 'react';
import * as styles from '@/ui/styles/Home.css';
import { UserProfile, useAuth } from '@/domain/auth';
import { PlaidLinkButton, AccountsList } from '@/domain/accounts';
import { Stack } from '@/ui/components/Stack';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';
import { Button } from '@/ui/components/Button';
import Link from 'next/link';

interface PlaidAccount {
  account_id: string;
  name: string;
  official_name: string;
  type: number;
  subtype: number;
  balance?: {
    available?: number;
    current?: number;
    limit?: number;
    iso_currency_code: string;
  };
  mask: string;
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState<PlaidAccount[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handlePlaidSuccess = (accounts: PlaidAccount[]) => {
    setConnectedAccounts(accounts);
    setError(null);
  };

  const handlePlaidError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Account Manager</title>
        <meta name="description" content="Connect and manage your bank accounts securely" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isAuthenticated && (
          <div style={{ 
            position: 'absolute', 
            top: '1rem', 
            right: '1rem' 
          }}>
            <UserProfile />
          </div>
        )}

        <Stack gap="lg" align="center" style={{ width: '100%', maxWidth: '800px' }}>
          <Stack gap="md" align="center">
            <h1 className={styles.title}>
              Account Manager
            </h1>
            <Text size="lg" variant="secondary" style={{ textAlign: 'center' }}>
              Connect your bank accounts securely and view your financial data in one place
            </Text>
          </Stack>

          {!isAuthenticated ? (
            <Card style={{ 
              padding: '2rem', 
              textAlign: 'center',
              maxWidth: '400px',
              width: '100%'
            }}>
              <Stack gap="md">
                <Text as="h3" size="lg" weight="semibold">Welcome!</Text>
                <Text variant="secondary">
                  Sign in to connect your bank accounts and start managing your finances.
                </Text>
                <Link href="/auth/otp">
                  <Button variant="primary" size="lg">
                    Sign In to Get Started
                  </Button>
                </Link>
              </Stack>
            </Card>
          ) : (
            <Stack gap="lg" align="center" style={{ width: '100%' }}>
              <Card style={{ 
                padding: '2rem', 
                textAlign: 'center',
                width: '100%',
                maxWidth: '500px'
              }}>
                <Stack gap="md">
                  <Text as="h3" size="lg" weight="semibold">
                    Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                  </Text>
                  <Text variant="secondary">
                    Connect your bank accounts to view balances and transactions.
                  </Text>
                  <PlaidLinkButton
                    onSuccess={handlePlaidSuccess}
                    onError={handlePlaidError}
                  />
                  {error && (
                    <Text variant="danger">
                      {error}
                    </Text>
                  )}
                </Stack>
              </Card>

              <AccountsList accounts={connectedAccounts} />
            </Stack>
          )}

          {/* Quick navigation for authenticated users */}
          {isAuthenticated && (
            <div className={styles.grid} style={{ marginTop: '2rem' }}>
              <Link href="/dashboard" className={styles.card}>
                <h2 className={styles.cardTitle}>Dashboard &rarr;</h2>
                <p className={styles.cardText}>View your complete financial overview</p>
              </Link>
              <Card className={styles.card} style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                <h2 className={styles.cardTitle}>Transactions</h2>
                <p className={styles.cardText}>Coming soon - View transaction history</p>
              </Card>
            </div>
          )}
        </Stack>
      </main>

      <footer className={styles.footer}>
        <Text size="xs" variant="secondary">
          Account Manager - Secure Financial Management
        </Text>
      </footer>
    </div>
  );
}
