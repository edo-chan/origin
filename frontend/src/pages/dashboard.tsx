import Head from 'next/head';
import * as styles from '../styles/Home.css';
import { GreeterExample } from '../domain/greeter';

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard - Template Project</title>
        <meta name="description" content="Dashboard for Template project with NextJS, React, Vanilla Extract, Rust, and gRPC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <GreeterExample />
      </main>
    </div>
  );
}
