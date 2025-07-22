import React, { useState, FormEvent } from 'react';
import { useGreeter } from '../hooks';
import * as styles from './GreeterExample.css';

const GreeterExample: React.FC = () => {
  const { name, setName, sayHello, reply, loading, error } = useGreeter();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      await sayHello();
    } catch (err) {
      console.error('Error saying hello:', err);
    }
  };

  return (
    <div className={styles.greeterExample}>
      <h2 className={styles.title}>Greeter Example</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Your Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className={styles.input}
          />
        </div>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Sending...' : 'Say Hello'}
        </button>
      </form>

      {error && (
        <div className={styles.errorMessage}>
          Error: {error.message}
        </div>
      )}

      {submitted && !loading && !error && reply && (
        <div className={styles.response}>
          <h3 className={styles.responseTitle}>Response:</h3>
          <p className={styles.responseMessage}>{reply.message}</p>
        </div>
      )}
    </div>
  );
};

export default GreeterExample;
