import Head from 'next/head';
import * as styles from '../styles/Home.css';
import { GreeterExample } from '../domain/greeter';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Template Project</title>
        <meta name="description" content="Template project with NextJS, React, Vanilla Extract, Rust, and gRPC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          This is a template project with NextJS, React, Vanilla Extract, Rust, and gRPC
        </p>

        <GreeterExample />

        <div className={styles.grid}>
          <a href="/auth" className={styles.card}>
            <h2 className={styles.cardTitle}>Login &rarr;</h2>
            <p className={styles.cardText}>Go to the K-pop styled login page.</p>
          </a>

          <a href="/dashboard" className={styles.card}>
            <h2 className={styles.cardTitle}>Dashboard &rarr;</h2>
            <p className={styles.cardText}>Go to the dashboard page.</p>
          </a>

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
