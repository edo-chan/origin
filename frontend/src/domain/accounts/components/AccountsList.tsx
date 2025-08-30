import React from 'react';
import { Card } from '@/ui/components/Card';
import { Stack } from '@/ui/components/Stack';
import { Text } from '@/ui/components/Text';
import * as styles from './AccountsList.css';

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

interface AccountsListProps {
  accounts: PlaidAccount[];
}

const formatCurrency = (amount: number | undefined, currencyCode = 'USD') => {
  if (amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

const getAccountTypeLabel = (type: number, subtype: number) => {
  // Map enum values to readable labels
  const typeMap: Record<number, string> = {
    0: 'Unknown',
    1: 'Depository',
    2: 'Credit',
    3: 'Loan',
    4: 'Investment',
    5: 'Other',
  };

  const subtypeMap: Record<number, string> = {
    0: 'Unknown',
    1: 'Checking',
    2: 'Savings',
    3: 'Credit Card',
    4: 'Mortgage',
    5: 'Auto',
    6: 'Student',
  };

  const typeLabel = typeMap[type] || 'Unknown';
  const subtypeLabel = subtypeMap[subtype] || 'Unknown';
  
  return `${typeLabel} - ${subtypeLabel}`;
};

export const AccountsList: React.FC<AccountsListProps> = ({ accounts }) => {
  if (accounts.length === 0) {
    return (
      <Card className={styles.emptyState}>
        <Text variant="secondary">
          {`No accounts connected yet. Click "Connect Bank Account" to get started.`}
        </Text>
      </Card>
    );
  }

  return (
    <Stack gap="md" className={styles.container}>
      <Text as="h3" size="lg" weight="semibold">Connected Accounts</Text>
      {accounts.map((account) => (
        <Card key={account.account_id} className={styles.accountCard}>
          <Stack gap="sm">
            <div className={styles.accountHeader}>
              <Text as="h4" size="base" weight="medium">{account.name}</Text>
              <Text size="xs" variant="secondary">
                ****{account.mask}
              </Text>
            </div>
            
            <Text variant="secondary">
              {account.official_name}
            </Text>
            
            <Text size="xs" variant="secondary">
              {getAccountTypeLabel(account.type, account.subtype)}
            </Text>

            {account.balance && (
              <div className={styles.balanceSection}>
                <div className={styles.balanceItem}>
                  <Text size="xs" variant="secondary">Available:</Text>
                  <Text weight="medium">
                    {formatCurrency(account.balance.available, account.balance.iso_currency_code)}
                  </Text>
                </div>
                <div className={styles.balanceItem}>
                  <Text size="xs" variant="secondary">Current:</Text>
                  <Text weight="medium">
                    {formatCurrency(account.balance.current, account.balance.iso_currency_code)}
                  </Text>
                </div>
                {account.balance.limit && (
                  <div className={styles.balanceItem}>
                    <Text size="xs" variant="secondary">Limit:</Text>
                    <Text weight="medium">
                      {formatCurrency(account.balance.limit, account.balance.iso_currency_code)}
                    </Text>
                  </div>
                )}
              </div>
            )}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
};