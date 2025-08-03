import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { 
  UserProfile,
  UserSession,
  CompleteOAuthResponse
} from '@/proto/auth';

// Type aliases for backward compatibility
type User = UserProfile;
type Session = UserSession;
type HandleOAuthCallbackResponse = CompleteOAuthResponse;

// Define AuthErrorCode enum since it's not in proto
export enum AuthErrorCode {
  UNKNOWN = 0,
  INVALID_TOKEN = 1,
  INVALID_CODE = 2,
  TOKEN_EXPIRED = 3,
  INVALID_REFRESH_TOKEN = 4,
  SESSION_NOT_FOUND = 5,
  SESSION_EXPIRED = 6,
  INVALID_CREDENTIALS = 7,
  USER_NOT_FOUND = 8,
  INVALID_REQUEST = 9,
  OAUTH_SERVICE_ERROR = 10,
  NETWORK_ERROR = 11,
}

// Authentication state interface
export interface AuthState {
  user: User | null;
  session: Session | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  lastActivity: number;
  tokenExpiresAt: number | null;
}

// Authentication error interface
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: string;
  timestamp: number;
  requestId?: string;
}

// Google OAuth state for the authentication flow
export interface GoogleOAuthState {
  isInitializing: boolean;
  authorizationUrl: string | null;
  state: string | null;
  codeChallenge: string | null;
  isCallback: boolean;
  callbackError: string | null;
}

// Initial authentication state
const initialAuthState: AuthState = {
  user: null,
  session: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastActivity: Date.now(),
  tokenExpiresAt: null,
};

// Initial Google OAuth state
const initialOAuthState: GoogleOAuthState = {
  isInitializing: false,
  authorizationUrl: null,
  state: null,
  codeChallenge: null,
  isCallback: false,
  callbackError: null,
};

// Persistent storage keys
const AUTH_STORAGE_KEY = 'auth_state';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

// Base authentication atom with persistence for critical data
export const authStateAtom = atomWithStorage<AuthState>(AUTH_STORAGE_KEY, initialAuthState, {
  getItem: (key, defaultValue) => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      
      const parsed = JSON.parse(stored);
      
      // Validate token expiration on load
      const now = Date.now();
      if (parsed.tokenExpiresAt && parsed.tokenExpiresAt < now) {
        // Clear expired tokens but keep user info for refresh attempt
        return {
          ...parsed,
          accessToken: null,
          isAuthenticated: false,
          error: {
            code: 6, // AUTH_ERROR_SESSION_EXPIRED
            message: 'Session expired',
            timestamp: now
          }
        };
      }
      
      return parsed;
    } catch (error) {
      return defaultValue;
    }
  },
  setItem: (key, value) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Don't persist sensitive tokens in main storage
      const toStore = {
        ...value,
        accessToken: null, // Never persist access tokens
        refreshToken: null, // Handle refresh tokens separately
      };
      
      localStorage.setItem(key, JSON.stringify(toStore));
    } catch (error) {
      // Silently fail and continue
    }
  },
  removeItem: (key) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
});

// Separate secure storage for refresh token
export const refreshTokenAtom = atomWithStorage<string | null>(REFRESH_TOKEN_STORAGE_KEY, null, {
  getItem: (key, defaultValue) => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      // Use sessionStorage for refresh tokens for better security
      const stored = sessionStorage.getItem(key);
      return stored || defaultValue;
    } catch {
      return defaultValue;
    }
  },
  setItem: (key, value) => {
    if (typeof window === 'undefined') return;
    
    try {
      if (value) {
        sessionStorage.setItem(key, value);
      } else {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      // Silently fail and continue
    }
  },
  removeItem: (key) => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  }
});

// Google OAuth state atom (session-only, no persistence)
export const googleOAuthStateAtom = atom<GoogleOAuthState>(initialOAuthState);

// Derived atoms for easier access to specific auth properties
export const userAtom = atom(
  (get) => get(authStateAtom).user,
  (get, set, user: User | null) => {
    const currentState = get(authStateAtom);
    set(authStateAtom, {
      ...currentState,
      user,
      lastActivity: Date.now()
    });
  }
);

export const sessionAtom = atom(
  (get) => get(authStateAtom).session,
  (get, set, session: Session | null) => {
    const currentState = get(authStateAtom);
    set(authStateAtom, {
      ...currentState,
      session,
      lastActivity: Date.now()
    });
  }
);

export const accessTokenAtom = atom(
  (get) => get(authStateAtom).accessToken,
  (get, set, accessToken: string | null) => {
    const currentState = get(authStateAtom);
    set(authStateAtom, {
      ...currentState,
      accessToken,
      isAuthenticated: !!accessToken,
      lastActivity: Date.now()
    });
  }
);

export const isAuthenticatedAtom = atom(
  (get) => {
    const state = get(authStateAtom);
    const now = Date.now();
    
    // Check if we have valid, non-expired token
    return !!(
      state.accessToken && 
      state.isAuthenticated && 
      (!state.tokenExpiresAt || state.tokenExpiresAt > now)
    );
  }
);

export const isLoadingAtom = atom(
  (get) => get(authStateAtom).isLoading,
  (get, set, isLoading: boolean) => {
    const currentState = get(authStateAtom);
    set(authStateAtom, {
      ...currentState,
      isLoading
    });
  }
);

export const authErrorAtom = atom(
  (get) => get(authStateAtom).error,
  (get, set, error: AuthError | null) => {
    const currentState = get(authStateAtom);
    set(authStateAtom, {
      ...currentState,
      error
    });
  }
);

// Action atoms for authentication operations
export const loginSuccessAtom = atom(
  null,
  (get, set, response: HandleOAuthCallbackResponse) => {
    // Update all auth state
    set(authStateAtom, {
      user: response.user || null,
      session: null, // Session info not included in OAuth response
      accessToken: response.accessToken,
      refreshToken: null, // Handle separately
      isAuthenticated: !!response.accessToken,
      isLoading: false,
      error: null,
      lastActivity: Date.now(),
      tokenExpiresAt: Number(response.accessTokenExpiresAt), // Convert bigint to number
    });

    // Store refresh token separately
    if (response.refreshToken) {
      set(refreshTokenAtom, response.refreshToken);
    }

    // Clear OAuth state
    set(googleOAuthStateAtom, initialOAuthState);
  }
);

export const logoutAtom = atom(
  null,
  (get, set, reason?: string) => {
    // Clear all auth state
    set(authStateAtom, {
      ...initialAuthState,
      lastActivity: Date.now()
    });

    // Clear refresh token
    set(refreshTokenAtom, null);
    
    // Clear OAuth state
    set(googleOAuthStateAtom, initialOAuthState);
  }
);

export const updateTokensAtom = atom(
  null,
  (get, set, tokens: { accessToken: string; refreshToken?: string; expiresAt: number }) => {
    const currentState = get(authStateAtom);
    set(authStateAtom, {
      ...currentState,
      accessToken: tokens.accessToken,
      isAuthenticated: true,
      tokenExpiresAt: tokens.expiresAt * 1000,
      lastActivity: Date.now(),
      error: null // Clear any previous errors
    });

    if (tokens.refreshToken) {
      set(refreshTokenAtom, tokens.refreshToken);
    }
  }
);

// OAuth flow management atoms
export const initializeOAuthAtom = atom(
  null,
  (get, set, { authorizationUrl, state, codeChallenge }: {
    authorizationUrl: string;
    state: string;
    codeChallenge: string;
  }) => {
    set(googleOAuthStateAtom, {
      ...get(googleOAuthStateAtom),
      isInitializing: false,
      authorizationUrl,
      state,
      codeChallenge,
    });
  }
);

export const handleOAuthCallbackAtom = atom(
  null,
  (get, set, { isCallback, callbackError }: { isCallback: boolean; callbackError?: string }) => {
    set(googleOAuthStateAtom, {
      ...get(googleOAuthStateAtom),
      isCallback,
      callbackError: callbackError || null,
    });
  }
);

// Utility atoms for common checks
export const shouldRefreshTokenAtom = atom((get) => {
  const state = get(authStateAtom);
  const refreshToken = get(refreshTokenAtom);
  const now = Date.now();
  
  // Should refresh if we have a refresh token but no valid access token
  return !!(
    refreshToken &&
    (!state.accessToken || (state.tokenExpiresAt && state.tokenExpiresAt <= now + 60000)) // Refresh 1 minute before expiry
  );
});

export const isTokenExpiredAtom = atom((get) => {
  const state = get(authStateAtom);
  const now = Date.now();
  
  return !!(state.tokenExpiresAt && state.tokenExpiresAt <= now);
});