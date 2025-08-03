import React from 'react';
import Image from 'next/image';

// UserProfile component props interface
export interface UserProfileProps extends React.HTMLAttributes<HTMLDivElement> {
  user: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  };
  showAvatar?: boolean;
  showEmail?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
import {
  userProfileContainer,
  sizeVariants,
  avatarContainer,
  avatarSizeVariants,
  avatarImage,
  avatarFallback,
  userInfoContainer,
  userName,
  userNameSizeVariants,
  userEmail,
  userEmailSizeVariants,
  statusOnline,
  statusOffline,
} from './UserProfile.css';

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  showAvatar = true,
  showEmail = true,
  size = 'md',
  className,
  style,
  ...props
}) => {
  // Generate initials from user name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const classes = [
    userProfileContainer,
    sizeVariants[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const avatarClasses = [
    avatarContainer,
    avatarSizeVariants[size],
  ].join(' ');

  const userNameClasses = [
    userName,
    userNameSizeVariants[size],
  ].join(' ');

  const userEmailClasses = [
    userEmail,
    userEmailSizeVariants[size],
  ].join(' ');


  return (
    <div className={classes} style={style} {...props}>
      {/* User Avatar */}
      {showAvatar && (
        <div className={avatarClasses}>
          {user.picture ? (
            <Image
              src={user.picture}
              alt={`${user.name}'s profile picture`}
              className={avatarImage}
              width={64}
              height={64}
              onError={(e) => {
                // Hide the broken image and show fallback
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
          ) : null}
          
          {/* Avatar fallback with initials */}
          <div 
            className={avatarFallback}
            style={{ 
              display: user.picture ? 'none' : 'flex' 
            }}
            aria-label={`${user.name}'s profile initials`}
          >
            {getInitials(user.name)}
          </div>
          
          {/* Online status indicator */}
          <div
            className={statusOnline}
            aria-label="User is online"
            title="Online"
          />
        </div>
      )}

      {/* User Information */}
      <div className={userInfoContainer}>
        {/* User Name */}
        <h3 className={userNameClasses} title={user.name}>
          {user.name}
        </h3>
        
        {/* User Email */}
        {showEmail && (
          <p className={userEmailClasses} title={user.email}>
            {user.email}
          </p>
        )}
      </div>
    </div>
  );
};