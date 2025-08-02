import React from 'react';
import Head from 'next/head';
import { ProtectedRoute, UserProfile, useAuth, useToken } from '@/domain/auth';
import * as styles from '../styles/Home.css';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, isLoading } = useAuth();
  const { validation, expiresIn } = useToken();

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard - Template Project</title>
        <meta name="description" content="Protected dashboard for authenticated users" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          width: '100%'
        }}>
          <h1>Dashboard</h1>
          <UserProfile showTokenInfo={true} />
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '1200px'
        }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f5ebe0',
            borderRadius: '12px',
            border: '1px solid #d1b5a1'
          }}>
            <h2 style={{ marginBottom: '1rem', color: '#5a4938' }}>
              Welcome, {user?.name}!
            </h2>
            <p style={{ color: '#725c47', lineHeight: 1.6 }}>
              You&apos;re successfully authenticated and can access protected content.
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#725c47' }}>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Active:</strong> {user?.isActive ? 'Yes' : 'No'}</p>
              <p><strong>Verified:</strong> {user?.isVerified ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f5ebe0',
            borderRadius: '12px',
            border: '1px solid #d1b5a1'
          }}>
            <h2 style={{ marginBottom: '1rem', color: '#5a4938' }}>
              Session Information
            </h2>
            <div style={{ fontSize: '0.875rem', color: '#725c47' }}>
              <p><strong>Token Valid:</strong> {validation.isValid ? 'Yes' : 'No'}</p>
              <p><strong>Expires In:</strong> {Math.floor(expiresIn / 60)} minutes</p>
              <p><strong>Issued At:</strong> {
                validation.payload 
                  ? new Date(validation.payload.iat * 1000).toLocaleString()
                  : 'Unknown'
              }</p>
              <p><strong>Expires At:</strong> {
                validation.payload 
                  ? new Date(validation.payload.exp * 1000).toLocaleString()
                  : 'Unknown'
              }</p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f5ebe0',
          borderRadius: '12px',
          border: '1px solid #d1b5a1',
          width: '100%',
          maxWidth: '1200px',
          marginTop: '1.5rem'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#5a4938' }}>
            Protected Content
          </h2>
          <p style={{ color: '#725c47', lineHeight: 1.6, marginBottom: '1rem' }}>
            This content is only visible to authenticated users. The authentication system includes:
          </p>
          <ul style={{ color: '#725c47', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
            <li>Google OAuth integration with PKCE security</li>
            <li>JWT token management with automatic refresh</li>
            <li>Persistent authentication state with Jotai</li>
            <li>Protected route components</li>
            <li>Comprehensive error handling and logging</li>
            <li>Session management across devices</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
