import React, { useState, FormEvent } from 'react';
import { sayHello } from '../action';
import * as styles from './GreeterExample.css';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const GreeterExample: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await sayHello({ name: input });
      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.message,
        isUser: false,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Error: Failed to send message',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.greeterExample}>
      <h2 className={styles.title}>Greeter Service</h2>
      
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${message.isUser ? styles.userMessage : styles.botMessage}`}
          >
            <strong>{message.isUser ? 'You: ' : 'Greeter: '}</strong>
            {message.text}
          </div>
        ))}
        {loading && (
          <div className={styles.message}>
            <strong>Greeter: </strong>
            <em>Typing...</em>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.chatForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your name..."
          disabled={loading}
          className={styles.input}
        />
        <button type="submit" disabled={loading || !input.trim()} className={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
};

export default GreeterExample;
