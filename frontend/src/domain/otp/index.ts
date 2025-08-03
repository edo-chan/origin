// OTP domain exports
export * from './atoms';
export * from './hooks';
export * from './action';

// Components
export { OtpLoginForm } from './components/OtpLoginForm';

// Re-export types from proto for convenience
export type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '@/proto/auth';