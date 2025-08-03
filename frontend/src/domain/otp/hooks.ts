/**
 * OTP hooks for easy state management and actions
 */

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import {
  otpAtom,
  otpEmailAtom,
  otpCodeAtom,
  otpLoadingAtom,
  otpErrorAtom,
  otpSentAtom,
  resetOtpAtom,
  isOtpValidAtom,
  canResendOtpAtom,
} from './atoms';
import { sendOtp, verifyOtp } from './action';
import type { SendOtpRequest, VerifyOtpRequest } from '@/proto/auth';

export function useOtpState() {
  return useAtom(otpAtom);
}

export function useOtpEmail() {
  return useAtom(otpEmailAtom);
}

export function useOtpCode() {
  return useAtom(otpCodeAtom);
}

export function useOtpLoading() {
  return useAtomValue(otpLoadingAtom);
}

export function useOtpError() {
  return useAtom(otpErrorAtom);
}

export function useOtpSent() {
  return useAtomValue(otpSentAtom);
}

export function useIsOtpValid() {
  return useAtomValue(isOtpValidAtom);
}

export function useCanResendOtp() {
  return useAtomValue(canResendOtpAtom);
}

export function useResetOtp() {
  return useSetAtom(resetOtpAtom);
}

export function useSendOtp() {
  const setOtpState = useSetAtom(otpAtom);
  const setError = useSetAtom(otpErrorAtom);
  const setLoading = useSetAtom(otpLoadingAtom);

  return useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const request: SendOtpRequest = { email };
      const response = await sendOtp(request);

      if (response.success) {
        setOtpState(prev => ({
          ...prev,
          email,
          isOtpSent: true,
          expiresAt: Number(response.expiresAt),
          attemptsRemaining: response.attemptsAllowed,
        }));
      } else {
        setError(response.message);
      }

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setOtpState, setError, setLoading]);
}

export function useVerifyOtp() {
  const setOtpState = useSetAtom(otpAtom);
  const setError = useSetAtom(otpErrorAtom);
  const setLoading = useSetAtom(otpLoadingAtom);

  return useCallback(async (email: string, code: string, deviceInfo?: string) => {
    try {
      setLoading(true);
      setError(null);

      const request: VerifyOtpRequest = {
        email,
        code,
        deviceInfo,
        ipAddress: undefined, // This would typically be set by the backend
        userAgent: navigator.userAgent,
      };

      const response = await verifyOtp(request);

      if (response.success) {
        // Reset OTP state on successful verification
        setOtpState(prev => ({
          ...prev,
          code: '',
          error: null,
        }));
      } else {
        setError(response.message);
        setOtpState(prev => ({
          ...prev,
          attemptsRemaining: response.attemptsRemaining,
        }));
      }

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify OTP';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setOtpState, setError, setLoading]);
}