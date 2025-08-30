import React, { useCallback, useState } from 'react';
import { Button } from '@/ui/components/Button';
import { Loading } from '@/ui/components/Loading';
import * as styles from './PlaidLinkButton.css';

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

interface PlaidLinkButtonProps {
  onSuccess?: (accounts: PlaidAccount[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const exchangePublicToken = useCallback(async (publicToken: string) => {
    try {
      const response = await fetch('/api/accounts/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token: publicToken,
          user_id: 'demo-user', // TODO: Get from auth context
          institution_name: 'Demo Bank',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange public token');
      }

      const data = await response.json();
      
      if (data.success) {
        onSuccess?.(data.accounts);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error exchanging public token:', error);
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  const createLinkToken = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call backend to create link token
      const response = await fetch('/api/accounts/plaid/link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'demo-user', // TODO: Get from auth context
          client_name: 'Your App',
          country_codes: ['US'],
          language: 'en',
          products: [1, 2], // TRANSACTIONS, ACCOUNTS
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create link token');
      }

      const data = await response.json();
      setLinkToken(data.link_token);
      
      // In a real app, you would initialize Plaid Link here
      // For now, we'll simulate the flow
      setTimeout(() => {
        exchangePublicToken('mock-public-token');
      }, 1000);

    } catch (error) {
      console.error('Error creating link token:', error);
      onError?.(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  }, [onError, exchangePublicToken]);

  const handleClick = useCallback(() => {
    if (!disabled && !isLoading) {
      createLinkToken();
    }
  }, [disabled, isLoading, createLinkToken]);

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={styles.button}
    >
      {isLoading ? (
        <>
          <Loading size="sm" />
          <span style={{ marginLeft: '0.5rem' }}>
            {linkToken ? 'Connecting...' : 'Preparing...'}
          </span>
        </>
      ) : (
        'Connect Bank Account'
      )}
    </Button>
  );
};