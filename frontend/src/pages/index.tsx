import Head from 'next/head';
import Link from 'next/link';
import * as styles from '@/ui/styles/Home.css';
import { GreeterExample } from '../domain/greeter';
import { UserProfile, useAuth } from '@/domain/auth';
import { Stack } from '@/ui/components/Stack';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className={styles.container}>
      <Head>
        <title>Template Project</title>
        <meta name="description" content="Template project with NextJS, React, Vanilla Extract, Rust, and gRPC with Google OAuth" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isAuthenticated && (
          <div style={{ 
            position: 'absolute', 
            top: '1rem', 
            right: '1rem' 
          }}>
            <UserProfile />
          </div>
        )}

        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          This is a template project with NextJS, React, Vanilla Extract, Rust, and gRPC
          {isAuthenticated && <><br />Hello, {user?.name}! You&apos;re signed in.</>}
        </p>

        {!isAuthenticated && (
          <Stack gap="md" style={{ marginBottom: '2rem' }}>
            <Link href="/auth/otp" className={styles.card} style={{ 
              display: 'inline-block', 
              textDecoration: 'none',
              textAlign: 'center',
              padding: '1rem 2rem'
            }}>
              {"Sign In"}
            </Link>
          </Stack>
        )}

        <GreeterExample />

        <div className={styles.grid}>
          <Link href="/auth/otp" className={styles.card}>
            <h2 className={styles.cardTitle}>Sign In &rarr;</h2>
            <p className={styles.cardText}>Sign in with email or Google OAuth.</p>
          </Link>

          <Link href="/dashboard" className={styles.card}>
            <h2 className={styles.cardTitle}>Dashboard &rarr;</h2>
            <p className={styles.cardText}>Go to the protected dashboard page.</p>
          </Link>

          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2 className={styles.cardTitle}>NextJS &rarr;</h2>
            <p className={styles.cardText}>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://reactjs.org" className={styles.card}>
            <h2 className={styles.cardTitle}>React &rarr;</h2>
            <p className={styles.cardText}>Learn about React, the JavaScript library for building user interfaces.</p>
          </a>

          <a href="https://vanilla-extract.style" className={styles.card}>
            <h2 className={styles.cardTitle}>Vanilla Extract &rarr;</h2>
            <p className={styles.cardText}>Discover the zero-runtime CSS-in-JS library with TypeScript support.</p>
          </a>

          <a href="https://www.rust-lang.org" className={styles.card}>
            <h2 className={styles.cardTitle}>Rust &rarr;</h2>
            <p className={styles.cardText}>Explore Rust, a language empowering everyone to build reliable and efficient software.</p>
          </a>

          <a href="https://grpc.io" className={styles.card}>
            <h2 className={styles.cardTitle}>gRPC &rarr;</h2>
            <p className={styles.cardText}>Learn about gRPC, a high-performance, open-source universal RPC framework.</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          Template Project
        </a>
      </footer>
    </div>
  );
}
