import React, { useState, FormEvent } from 'react';
import { sayHello } from '../action';
import { Card, Button, Input, Text, ChatBubble, Loading, Stack, Tag } from '../../../ui/components';
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
    <div data-theme="kdrama" style={{ minHeight: '100vh', background: '#fefefe', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
          
          {/* Header */}
          <Stack direction="column" gap="md" align="center">
            <Text as="h1" size="2xl" weight="bold" variant="primary" style={{ 
              fontFamily: '"Noto Serif KR", "Nanum Myeongjo", serif',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f48fb1, #ce93d8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🌸 안녕하세요 (Annyeonghaseyo) 🌸
            </Text>
            <Text size="lg" variant="secondary" style={{ textAlign: 'center' }}>
              Welcome to our K-drama inspired greeting service
            </Text>
            <Stack direction="row" gap="sm" align="center">
              <Tag variant="primary" size="sm">💕 Romance</Tag>
              <Tag variant="secondary" size="sm">🌅 Seoul Vibes</Tag>
              <Tag variant="tertiary" size="sm">🌸 Cherry Blossom</Tag>
            </Stack>
          </Stack>

          {/* Chat Container */}
          <div style={{ width: '100%', maxWidth: '1000px' }}>
            <Card variant="primary" size="lg" style={{ width: '100%', minWidth: '800px' }}>
          <Stack direction="column" gap="lg">
            
            {/* Messages */}
            <div style={{ 
              minHeight: '400px', 
              maxHeight: '500px', 
              overflowY: 'auto',
              padding: '20px',
              background: '#faf8ff',
              borderRadius: '16px',
              border: '2px solid #e0e0e0',
              width: '100%'
            }}>
              {messages.length === 0 && (
                <Stack direction="column" gap="md" align="center" style={{ textAlign: 'center', paddingTop: '80px' }}>
                  <Text size="lg" variant="secondary">💭</Text>
                  <Text variant="secondary">Send a greeting to start our conversation!</Text>
                  <Text size="sm" variant="secondary" style={{ fontStyle: 'italic' }}>
                    &ldquo;The best relationships begin with hello&rdquo; - K-drama wisdom
                  </Text>
                </Stack>
              )}
              
              <Stack direction="column" gap="lg">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    style={{ 
                      display: 'flex',
                      justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    <div style={{ 
                      minWidth: '200px', 
                      maxWidth: '75%', 
                      width: 'fit-content',
                      display: 'flex',
                      justifyContent: message.isUser ? 'flex-end' : 'flex-start'
                    }}>
                      <ChatBubble
                        variant={message.isUser ? 'primary' : 'secondary'}
                        position={message.isUser ? 'right' : 'left'}
                        timestamp={new Date(message.id).toLocaleTimeString()}
                        avatar={message.isUser ? '👤' : '🌸'}
                        size="lg"
                      >
                        <Stack direction="column" gap="xs">
                          <Text size="sm" weight="medium" variant="secondary">
                            {message.isUser ? 'You' : 'K-Greeter'}
                          </Text>
                          <Text size="base" variant="secondary">
                            {message.text}
                          </Text>
                        </Stack>
                      </ChatBubble>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                    <Stack direction="row" gap="sm" align="center" style={{ 
                      padding: '16px', 
                      background: '#f0f0f0', 
                      borderRadius: '12px',
                      maxWidth: '250px'
                    }}>
                      <Loading size="sm" variant="primary" />
                      <Text variant="secondary" size="sm" style={{ fontStyle: 'italic' }}>
                        K-Greeter is typing... 💭
                      </Text>
                    </Stack>
                  </div>
                )}
              </Stack>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit}>
              <Stack direction="column" gap="md">
                <Input
                  variant="primary"
                  label="Your Name"
                  placeholder="Enter your name for a personalized K-drama greeting..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  style={{ fontSize: '16px' }}
                />
                
                <Stack direction="row" gap="sm" justify="space-between" align="center">
                  <Text size="sm" variant="secondary" style={{ fontStyle: 'italic' }}>
                    ✨ Get a warm Korean-style greeting
                  </Text>
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={loading || !input.trim()}
                    style={{ 
                      background: 'linear-gradient(135deg, #f48fb1, #ffab91)',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    {loading ? '💭 Sending...' : '🌸 Send Greeting'}
                  </Button>
                </Stack>
              </Stack>
            </form>
            
          </Stack>
          </Card>
        </div>

        {/* Footer */}
        <Stack direction="column" gap="sm" align="center">
          <Text size="sm" variant="secondary" style={{ textAlign: 'center', fontStyle: 'italic' }}>
            Inspired by the warmth and beauty of Korean culture 🇰🇷
          </Text>
          <Stack direction="row" gap="sm" align="center">
            <Text size="sm" variant="secondary">Made with</Text>
            <Text size="sm" variant="primary">💕</Text>
            <Text size="sm" variant="secondary">in Seoul style</Text>
          </Stack>
        </Stack>

        </div>
      </div>
    </div>
  );
};

export default GreeterExample;
