// Authentication-related TypeScript interfaces and types

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface GoogleLoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_ERROR'; payload: { error: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_RESET_ERROR' };

// Component prop interfaces
export interface GoogleLoginButtonProps {
  /** Button text content */
  text?: string;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is in loading state */
  isLoading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Callback function for successful login */
  onSuccess?: (response: GoogleLoginResponse) => void;
  /** Callback function for login error */
  onError?: (error: AuthError) => void;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export interface AuthGuardProps {
  /** Children to render when authenticated */
  children: React.ReactNode;
  /** Component to render when not authenticated */
  fallback?: React.ReactNode;
  /** Redirect URL for unauthenticated users */
  redirectTo?: string;
  /** Whether to show loading state */
  showLoading?: boolean;
}

export interface UserProfileProps {
  /** User data to display */
  user: User;
  /** Whether to show the user's avatar */
  showAvatar?: boolean;
  /** Whether to show the user's email */
  showEmail?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export interface LogoutButtonProps {
  /** Button text content */
  text?: string;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Whether the button is in loading state */
  isLoading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Callback function for logout */
  onLogout?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export interface AuthLoadingSpinnerProps {
  /** Loading message to display */
  message?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export interface AuthErrorMessageProps {
  /** Error message to display */
  error: string | AuthError;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Callback function for retry action */
  onRetry?: () => void;
  /** Whether the error can be dismissed */
  dismissible?: boolean;
  /** Callback function for dismiss action */
  onDismiss?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}