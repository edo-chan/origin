/**
 * OTP state management with Jotai atoms
 */

import { atom } from 'jotai';

// OTP form state
export interface OtpState {
  email: string;
  code: string;
  isLoading: boolean;
  error: string | null;
  isOtpSent: boolean;
  expiresAt: number | null;
  attemptsRemaining: number;
}

// Initial state
const initialOtpState: OtpState = {
  email: '',
  code: '',
  isLoading: false,
  error: null,
  isOtpSent: false,
  expiresAt: null,
  attemptsRemaining: 0,
};

// Primary atom for OTP state
export const otpAtom = atom<OtpState>(initialOtpState);

// Derived atoms for specific parts of the state
export const otpEmailAtom = atom(
  (get) => get(otpAtom).email,
  (get, set, email: string) => {
    set(otpAtom, { ...get(otpAtom), email });
  }
);

export const otpCodeAtom = atom(
  (get) => get(otpAtom).code,
  (get, set, code: string) => {
    set(otpAtom, { ...get(otpAtom), code });
  }
);

export const otpLoadingAtom = atom(
  (get) => get(otpAtom).isLoading,
  (get, set, isLoading: boolean) => {
    set(otpAtom, { ...get(otpAtom), isLoading });
  }
);

export const otpErrorAtom = atom(
  (get) => get(otpAtom).error,
  (get, set, error: string | null) => {
    set(otpAtom, { ...get(otpAtom), error });
  }
);

export const otpSentAtom = atom(
  (get) => get(otpAtom).isOtpSent,
  (get, set, isOtpSent: boolean) => {
    set(otpAtom, { ...get(otpAtom), isOtpSent });
  }
);

// Reset atom to clear all OTP state
export const resetOtpAtom = atom(null, (get, set) => {
  set(otpAtom, initialOtpState);
});

// Computed atoms
export const isOtpValidAtom = atom((get) => {
  const state = get(otpAtom);
  return state.code.length >= 6; // Assuming 6-digit OTP
});

export const canResendOtpAtom = atom((get) => {
  const state = get(otpAtom);
  if (!state.expiresAt) return false;
  return Date.now() > state.expiresAt;
});