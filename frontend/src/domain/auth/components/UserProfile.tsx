import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useToken } from '../hooks';
import * as styles from './UserProfile.css';

interface UserProfileProps {
  /** Whether to show detailed token information (for development) */
  showTokenInfo?: boolean;
  /** Variant of the profile display */
  variant?: 'default' | 'compact';
  /** Whether to show the user name in the trigger */
  showName?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Callback fired when logout is initiated */
  onLogout?: () => void;
}

/**
 * User profile dropdown component with logout functionality
 * Shows user info, token details, and logout options
 */
export function UserProfile({
  showTokenInfo = false,
  variant = 'default',
  showName = true,
  className,
  onLogout
}: UserProfileProps) {
  const { user, logout, isLoading } = useAuth();
  const { validation, expiresIn } = useToken();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleLogout = async (allDevices = false) => {
    setIsLoggingOut(true);
    onLogout?.();
    
    console.info('User Action', {
      action: 'logout_initiated',
      component: 'UserProfile',
      allDevices,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    try {
      await logout(allDevices);
    } catch (error) {
      console.error('User Action', {
        action: 'logout_failed',
        component: 'UserProfile',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const handleTriggerClick = () => {
    console.debug('User Action', {
      action: 'profile_dropdown_toggled',
      component: 'UserProfile',
      newState: !isOpen,
      timestamp: new Date().toISOString()
    });
    setIsOpen(!isOpen);
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return null;
  }

  const triggerClass = variant === 'compact' 
    ? `${styles.compactTrigger} ${className || ''}`.trim()
    : `${styles.trigger} ${className || ''}`.trim();

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        ref={triggerRef}
        className={triggerClass}
        onClick={handleTriggerClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`User menu for ${user.name}`}
        disabled={isLoading || isLoggingOut}
      >
        {user.pictureUrl ? (
          <Image
            src={user.pictureUrl}
            alt={`${user.name}'s avatar`}
            className={variant === 'compact' ? styles.compactAvatar : styles.avatar}
            width={32}
            height={32}
            onError={(e) => {
              // Replace with fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : (
          <div className={variant === 'compact' ? styles.compactAvatarFallback : styles.avatarFallback}>
            {getInitials(user.name)}
          </div>
        )}
        
        {showName && variant !== 'compact' && (
          <span className={styles.userName}>{user.name}</span>
        )}
        
        {isLoading || isLoggingOut ? (
          <div className={styles.loadingSpinner} />
        ) : (
          <ChevronDownIcon />
        )}
      </button>

      <div
        className={styles.dropdown}
        data-state={isOpen ? 'open' : 'closed'}
        role="menu"
        aria-labelledby="user-menu-trigger"
      >
        <div className={styles.profileHeader}>
          {user.pictureUrl ? (
            <Image
              src={user.pictureUrl}
              alt={`${user.name}'s avatar`}
              className={styles.profileAvatar}
              width={48}
              height={48}
            />
          ) : (
            <div className={styles.profileAvatarFallback}>
              {getInitials(user.name)}
            </div>
          )}
          
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>{user.name}</div>
            <div className={styles.profileEmail}>{user.email}</div>
          </div>
        </div>

        {showTokenInfo && validation.payload && (
          <div className={styles.menuSection}>
            <div className={styles.tokenInfo}>
              <span className={styles.tokenLabel}>Session expires:</span>
              <span className={styles.tokenValue}>
                {formatTimeRemaining(expiresIn)}
              </span>
            </div>
          </div>
        )}

        <div className={styles.menuSection}>
          <Link href="/profile" className={styles.menuItem} role="menuitem">
            Edit Profile
          </Link>
          <Link href="/settings" className={styles.menuItem} role="menuitem">
            Settings
          </Link>
          <Link href="/sessions" className={styles.menuItem} role="menuitem">
            Active Sessions
          </Link>
        </div>

        <hr className={styles.divider} />

        <div className={styles.menuSection}>
          <button
            className={styles.menuItem}
            onClick={() => handleLogout(false)}
            disabled={isLoggingOut}
            role="menuitem"
          >
            Sign out
          </button>
          <button
            className={styles.menuItemDanger}
            onClick={() => handleLogout(true)}
            disabled={isLoggingOut}
            role="menuitem"
          >
            Sign out all devices
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Chevron down icon component
 */
function ChevronDownIcon() {
  return (
    <svg
      className={styles.chevronIcon}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}