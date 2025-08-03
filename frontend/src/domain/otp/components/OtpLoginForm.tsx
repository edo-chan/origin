import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { Stack } from '@/ui/components/Stack';
import { Text } from '@/ui/components/Text';
import { 
  useSendOtp, 
  useVerifyOtp, 
  useOtpEmail, 
  useOtpCode, 
  useOtpLoading, 
  useOtpError, 
  useOtpSent,
  useCanResendOtp,
  useResetOtp 
} from '../hooks';
import { setTokens } from '@/domain/auth/tokenManager';

interface OtpLoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function OtpLoginForm({ onSuccess, redirectTo = '/dashboard' }: OtpLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useOtpEmail();
  const [code, setCode] = useOtpCode();
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const isLoading = useOtpLoading();
  const [error, setError] = useOtpError();
  const isOtpSent = useOtpSent();
  const canResend = useCanResendOtp();
  const resetOtp = useResetOtp();
  
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await sendOtp(email);
      setResendCountdown(60); // 60 second cooldown
      setError(null);
    } catch (err) {
      console.error('Failed to send OTP:', err);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      const response = await verifyOtp(email, code);
      
      if (response.success && response.accessToken && response.refreshToken) {
        // Store tokens
        setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          accessTokenExpiresAt: Number(response.accessTokenExpiresAt || 0),
          refreshTokenExpiresAt: Number(response.refreshTokenExpiresAt || 0),
        });

        // Reset form
        resetOtp();
        
        // Call success callback or redirect
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
        }
      }
    } catch (err) {
      console.error('Failed to verify OTP:', err);
    }
  };

  const handleResendOtp = async () => {
    if (canResend && resendCountdown === 0) {
      try {
        await sendOtp(email);
        setResendCountdown(60);
        setError(null);
      } catch (err) {
        console.error('Failed to resend OTP:', err);
      }
    }
  };

  const handleReset = () => {
    resetOtp();
    setResendCountdown(0);
  };

  if (!isOtpSent) {
    return (
      <form onSubmit={handleSendOtp}>
        <Stack gap="lg">
          <Stack gap="sm">
            <Text as="h2" variant="primary" size="xl">{"Sign in with Email"}</Text>
            <Text variant="secondary">
              {"Enter your email address to receive a login code"}
            </Text>
          </Stack>

          {error && (
            <Stack gap="none" style={{ 
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem'
            }}>
              <Text variant="danger" size="sm" style={{ color: '#ff6b6b' }}>
                {error}
              </Text>
            </Stack>
          )}

          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? "Sending..." : "Send Login Code"}
          </Button>
        </Stack>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp}>
      <Stack gap="lg">
        <Stack gap="sm">
          <Text as="h2" variant="primary" size="xl">{"Enter Login Code"}</Text>
          <Text variant="secondary">
            {`We sent a 6-digit code to ${email}`}
          </Text>
        </Stack>

        {error && (
          <Stack gap="none" style={{ 
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem'
          }}>
            <Text variant="secondary" size="sm" style={{ color: '#ff6b6b' }}>
              {error}
            </Text>
          </Stack>
        )}

        <Input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          disabled={isLoading}
          maxLength={6}
          style={{
            textAlign: 'center',
            fontSize: '1.5rem',
            letterSpacing: '0.5rem',
            fontFamily: 'monospace'
          }}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading || code.length < 6}
        >
          {isLoading ? "Verifying..." : "Sign In"}
        </Button>

        <Stack gap="sm" style={{ textAlign: 'center' }}>
          <Text variant="secondary" size="sm" style={{ color: 'rgba(224, 224, 224, 0.6)' }}>
            {"Didn't receive the code?"}
          </Text>
          
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleResendOtp}
            disabled={!canResend || resendCountdown > 0}
          >
            {resendCountdown > 0 
              ? `Resend in ${resendCountdown}s` 
              : "Resend code"
            }
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleReset}
          >
            {"Use different email"}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}