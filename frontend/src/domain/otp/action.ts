/**
 * OTP action functions for the otp domain
 * These functions handle backend communication through the backend API
 */

import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '@/proto/auth';

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:49999';

export async function sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/otp/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export async function verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}