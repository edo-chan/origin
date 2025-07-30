import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import * as styles from '../styles/Auth.css';

export default function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically connect to an authentication service
    console.log('Login attempt:', { username, password });
    alert('Login functionality would be implemented here');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Login - K-drama Style</title>
        <meta name="description" content="Login to your account with K-drama style" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Decorative elements */}
      <div className={styles.decorationTop} />
      <div className={styles.decorationBottom} />

      <main className={styles.main}>
        <h1 className={styles.title}>Login</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              id="username"
              type="text"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className={styles.button}>
            Sign In
          </button>
        </form>

        <div className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/" className={styles.link}>
            Sign up
          </Link>
          {' | '}
          <Link href="/" className={styles.link}>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
