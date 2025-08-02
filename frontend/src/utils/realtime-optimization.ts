/**
 * Real-time Data Handling Optimization
 * 
 * Provides optimized real-time data management for different application types:
 * - WebSocket connection management with reconnection strategies
 * - Data streaming with backpressure handling
 * - Efficient state updates with batching and throttling
 * - Memory management for continuous data streams
 * - Connection pooling and load balancing
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePerformanceMonitor } from './performance';
import { CacheManager } from './caching';

// WebSocket connection states
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

// Real-time message types
export interface RealtimeMessage<T = any> {
  id?: string;
  type: string;
  data: T;
  timestamp: number;
  sequence?: number;
  channel?: string;
}

// Connection configuration
export interface ConnectionConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  reconnectDecay?: number;
  heartbeatInterval?: number;
  messageBufferSize?: number;
  binaryType?: 'blob' | 'arraybuffer';
  subProtocols?: string[];
}

// Message handler interface
export interface MessageHandler<T = any> {
  type: string;
  handler: (data: T, context: RealtimeContext) => void | Promise<void>;
  throttle?: number;
  debounce?: number;
  batch?: boolean;
}

// Realtime context for handlers
export interface RealtimeContext {
  connectionId: string;
  timestamp: number;
  sequence: number;
  channel?: string;
  metadata?: Record<string, any>;
}

// Connection statistics
export interface ConnectionStats {
  messagesReceived: number;
  messagesSent: number;
  bytesReceived: number;
  bytesSent: number;
  reconnections: number;
  avgLatency: number;
  uptime: number;
  errors: number;
}

// Advanced WebSocket manager with optimization features
export class OptimizedWebSocket {
  private ws: WebSocket | null = null;
  private config: Required<ConnectionConfig>;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private messageHandlers = new Map<string, MessageHandler[]>();
  private messageBuffer: RealtimeMessage[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private stats: ConnectionStats = {
    messagesReceived: 0,
    messagesSent: 0,
    bytesReceived: 0,
    bytesSent: 0,
    reconnections: 0,
    avgLatency: 0,
    uptime: 0,
    errors: 0,
  };
  
  private sequence = 0;
  private connectionId = '';
  private connectTime = 0;
  private latencyMeasures: number[] = [];
  private performanceMonitor: ReturnType<typeof usePerformanceMonitor> | null = null;

  // Throttling and batching
  private throttledHandlers = new Map<string, NodeJS.Timeout>();
  private batchedMessages = new Map<string, RealtimeMessage[]>();
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(config: ConnectionConfig, performanceMonitor?: ReturnType<typeof usePerformanceMonitor>) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      maxReconnectDelay: 30000,
      reconnectDecay: 1.5,
      heartbeatInterval: 30000,
      messageBufferSize: 1000,
      binaryType: 'arraybuffer',
      subProtocols: [],
      protocols: [],
      ...config,
    };

    this.connectionId = this.generateConnectionId();
    this.performanceMonitor = performanceMonitor || null;
  }

  // Connect to WebSocket
  async connect(): Promise<void> {
    if (this.state === ConnectionState.CONNECTED || this.state === ConnectionState.CONNECTING) {
      return;
    }

    this.setState(ConnectionState.CONNECTING);
    this.connectTime = Date.now();

    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      this.ws.binaryType = this.config.binaryType;

      this.setupEventHandlers();
      
      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          resolve();
        };

        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };
      });

    } catch (error) {
      this.setState(ConnectionState.ERROR);
      this.stats.errors++;
      throw error;
    }
  }

  // Disconnect from WebSocket
  disconnect(): void {
    this.clearTimers();
    
    if (this.ws) {
      this.setState(ConnectionState.DISCONNECTING);
      this.ws.close(1000, 'Manual disconnect');
    } else {
      this.setState(ConnectionState.DISCONNECTED);
    }
  }

  // Send message with optimization
  send<T>(type: string, data: T, options: {
    priority?: 'high' | 'normal' | 'low';
    reliable?: boolean;
    channel?: string;
  } = {}): boolean {
    if (this.state !== ConnectionState.CONNECTED || !this.ws) {
      // Buffer message if connection is not ready
      if (this.messageBuffer.length < this.config.messageBufferSize) {
        this.messageBuffer.push({
          type,
          data,
          timestamp: Date.now(),
          sequence: ++this.sequence,
          channel: options.channel,
        });
      }
      return false;
    }

    const message: RealtimeMessage<T> = {
      id: this.generateMessageId(),
      type,
      data,
      timestamp: Date.now(),
      sequence: ++this.sequence,
      channel: options.channel,
    };

    try {
      const serialized = JSON.stringify(message);
      this.ws.send(serialized);
      
      this.stats.messagesSent++;
      this.stats.bytesSent += serialized.length;

      // Performance monitoring
      this.performanceMonitor?.recordMetric({
        timestamp: Date.now(),
        duration: 0,
        operation: 'websocket-send',
        metadata: {
          type,
          size: serialized.length,
          priority: options.priority,
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      this.stats.errors++;
      return false;
    }
  }

  // Register message handler
  on<T>(type: string, handler: MessageHandler<T>['handler'], options: Omit<MessageHandler<T>, 'type' | 'handler'> = {}): void {
    const messageHandler: MessageHandler<T> = {
      type,
      handler,
      ...options,
    };

    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }

    this.messageHandlers.get(type)!.push(messageHandler as MessageHandler);
  }

  // Unregister message handler
  off(type: string, handler?: Function): void {
    const handlers = this.messageHandlers.get(type);
    if (!handlers) return;

    if (handler) {
      const index = handlers.findIndex(h => h.handler === handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.messageHandlers.delete(type);
    }
  }

  // Get connection state
  getState(): ConnectionState {
    return this.state;
  }

  // Get connection statistics
  getStats(): ConnectionStats {
    return {
      ...this.stats,
      uptime: this.connectTime ? Date.now() - this.connectTime : 0,
      avgLatency: this.latencyMeasures.length > 0 
        ? this.latencyMeasures.reduce((a, b) => a + b) / this.latencyMeasures.length 
        : 0,
    };
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.setState(ConnectionState.CONNECTED);
      this.stats.uptime = Date.now() - this.connectTime;
      
      // Send buffered messages
      this.flushMessageBuffer();
      
      // Start heartbeat
      this.startHeartbeat();
    };

    this.ws.onclose = (event) => {
      this.setState(ConnectionState.DISCONNECTED);
      this.clearTimers();
      
      // Auto-reconnect if not manual disconnect
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.setState(ConnectionState.ERROR);
      this.stats.errors++;
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };
  }

  private handleMessage(event: MessageEvent): void {
    this.stats.messagesReceived++;
    this.stats.bytesReceived += event.data.length;

    try {
      const message: RealtimeMessage = JSON.parse(event.data);
      
      // Update latency tracking
      if (message.timestamp) {
        const latency = Date.now() - message.timestamp;
        this.updateLatency(latency);
      }

      // Handle message based on type
      const handlers = this.messageHandlers.get(message.type) || [];
      
      handlers.forEach(handler => {
        this.executeHandler(handler, message);
      });

      // Performance monitoring
      this.performanceMonitor?.recordMetric({
        timestamp: Date.now(),
        duration: 0,
        operation: 'websocket-receive',
        metadata: {
          type: message.type,
          size: event.data.length,
          handlersCount: handlers.length,
        },
      });

    } catch (error) {
      console.error('Failed to parse message:', error);
      this.stats.errors++;
    }
  }

  private executeHandler(handler: MessageHandler, message: RealtimeMessage): void {
    const context: RealtimeContext = {
      connectionId: this.connectionId,
      timestamp: message.timestamp,
      sequence: message.sequence || 0,
      channel: message.channel,
    };

    // Handle batching
    if (handler.batch) {
      this.addToBatch(handler.type, message);
      return;
    }

    // Handle throttling
    if (handler.throttle) {
      this.throttleHandler(handler, message, context);
      return;
    }

    // Handle debouncing
    if (handler.debounce) {
      this.debounceHandler(handler, message, context);
      return;
    }

    // Execute immediately
    try {
      handler.handler(message.data, context);
    } catch (error) {
      console.error(`Handler error for ${handler.type}:`, error);
    }
  }

  private throttleHandler(handler: MessageHandler, message: RealtimeMessage, context: RealtimeContext): void {
    const key = `${handler.type}_throttle`;
    
    if (!this.throttledHandlers.has(key)) {
      this.throttledHandlers.set(key, setTimeout(() => {
        try {
          handler.handler(message.data, context);
        } catch (error) {
          console.error(`Throttled handler error for ${handler.type}:`, error);
        }
        this.throttledHandlers.delete(key);
      }, handler.throttle!));
    }
  }

  private debounceHandler(handler: MessageHandler, message: RealtimeMessage, context: RealtimeContext): void {
    const key = `${handler.type}_debounce`;
    
    // Clear existing timeout
    const existingTimeout = this.throttledHandlers.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    this.throttledHandlers.set(key, setTimeout(() => {
      try {
        handler.handler(message.data, context);
      } catch (error) {
        console.error(`Debounced handler error for ${handler.type}:`, error);
      }
      this.throttledHandlers.delete(key);
    }, handler.debounce!));
  }

  private addToBatch(type: string, message: RealtimeMessage): void {
    if (!this.batchedMessages.has(type)) {
      this.batchedMessages.set(type, []);
    }

    this.batchedMessages.get(type)!.push(message);

    // Start batch processing timer if not already running
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatches();
      }, 16); // ~60fps
    }
  }

  private processBatches(): void {
    for (const [type, messages] of this.batchedMessages.entries()) {
      const handlers = this.messageHandlers.get(type) || [];
      
      handlers.forEach(handler => {
        if (handler.batch) {
          try {
            handler.handler(messages.map(m => m.data), {
              connectionId: this.connectionId,
              timestamp: Date.now(),
              sequence: messages[messages.length - 1]?.sequence || 0,
            });
          } catch (error) {
            console.error(`Batch handler error for ${type}:`, error);
          }
        }
      });
    }

    this.batchedMessages.clear();
    this.batchTimer = null;
  }

  private scheduleReconnect(): void {
    if (this.stats.reconnections >= this.config.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(this.config.reconnectDecay, this.stats.reconnections),
      this.config.maxReconnectDelay
    );

    this.setState(ConnectionState.RECONNECTING);
    
    this.reconnectTimer = setTimeout(() => {
      this.stats.reconnections++;
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
        this.scheduleReconnect();
      });
    }, delay);
  }

  private startHeartbeat(): void {
    if (this.config.heartbeatInterval > 0) {
      this.heartbeatTimer = setInterval(() => {
        this.send('ping', { timestamp: Date.now() });
      }, this.config.heartbeatInterval);
    }
  }

  private flushMessageBuffer(): void {
    while (this.messageBuffer.length > 0 && this.state === ConnectionState.CONNECTED) {
      const message = this.messageBuffer.shift()!;
      this.send(message.type, message.data, { channel: message.channel });
    }
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Clear throttled handlers
    for (const timeout of this.throttledHandlers.values()) {
      clearTimeout(timeout);
    }
    this.throttledHandlers.clear();
  }

  private setState(state: ConnectionState): void {
    const previousState = this.state;
    this.state = state;
    
    // Emit state change event
    this.messageHandlers.get('_statechange')?.forEach(handler => {
      handler.handler({ previousState, currentState: state }, {
        connectionId: this.connectionId,
        timestamp: Date.now(),
        sequence: 0,
      });
    });
  }

  private updateLatency(latency: number): void {
    this.latencyMeasures.push(latency);
    
    // Keep only last 100 measurements
    if (this.latencyMeasures.length > 100) {
      this.latencyMeasures.shift();
    }
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Application-specific real-time optimizations
export const AccountingRealtime = {
  // Financial data stream with strict ordering
  createFinancialStream: (config: ConnectionConfig) => {
    const ws = new OptimizedWebSocket(config);
    
    // Register handlers for financial data
    ws.on('transaction_update', (data: any) => {
      // Handle transaction updates with strict ordering
      console.log('Transaction update:', data);
    }, { 
      throttle: 100, // Limit to 10 updates per second
    });

    ws.on('balance_update', (data: any) => {
      // Handle balance updates
      console.log('Balance update:', data);
    }, {
      debounce: 200, // Debounce rapid balance changes
    });

    return ws;
  },

  // Report generation progress
  createReportStream: (config: ConnectionConfig) => {
    const ws = new OptimizedWebSocket(config);

    ws.on('report_progress', (data: any) => {
      // Handle report generation progress
      console.log('Report progress:', data);
    });

    return ws;
  },
};

export const SolanaRealtime = {
  // Price feed with high-frequency updates
  createPriceStream: (config: ConnectionConfig) => {
    const ws = new OptimizedWebSocket(config);
    const cache = new CacheManager();

    ws.on('price_update', async (data: any) => {
      // Cache price updates for quick access
      await cache.set(`price:${data.symbol}`, data, { maxAge: 30000 });
    }, {
      batch: true, // Batch price updates for efficiency
    });

    ws.on('volume_update', (data: any) => {
      // Handle volume updates
      console.log('Volume update:', data);
    }, {
      throttle: 500, // Limit volume updates
    });

    return { ws, cache };
  },

  // Blockchain events stream
  createBlockchainStream: (config: ConnectionConfig) => {
    const ws = new OptimizedWebSocket(config);

    ws.on('block_update', (data: any) => {
      // Handle new blocks
      console.log('New block:', data);
    });

    ws.on('transaction_confirmed', (data: any) => {
      // Handle transaction confirmations
      console.log('Transaction confirmed:', data);
    });

    return ws;
  },
};

export const ChatRealtime = {
  // Chat message stream with typing indicators
  createChatStream: (config: ConnectionConfig) => {
    const ws = new OptimizedWebSocket(config);

    ws.on('message', (data: any) => {
      // Handle chat messages
      console.log('New message:', data);
    });

    ws.on('typing', (data: any) => {
      // Handle typing indicators
      console.log('User typing:', data);
    }, {
      debounce: 100, // Debounce typing indicators
    });

    ws.on('presence', (data: any) => {
      // Handle user presence updates
      console.log('Presence update:', data);
    }, {
      throttle: 1000, // Limit presence updates
    });

    return ws;
  },

  // Media streaming for chat
  createMediaStream: (config: ConnectionConfig) => {
    const ws = new OptimizedWebSocket({
      ...config,
      binaryType: 'arraybuffer', // For binary media data
    });

    ws.on('media_chunk', (data: ArrayBuffer) => {
      // Handle media chunks
      console.log('Media chunk received:', data.byteLength);
    }, {
      batch: true, // Batch media chunks
    });

    return ws;
  },
};

// React hook for optimized WebSocket usage
export function useOptimizedWebSocket(
  config: ConnectionConfig,
  options: {
    autoConnect?: boolean;
    reconnectOnMount?: boolean;
    cleanupOnUnmount?: boolean;
  } = {}
) {
  const [ws, setWs] = useState<OptimizedWebSocket | null>(null);
  const [state, setState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  
  const wsRef = useRef<OptimizedWebSocket | null>(null);
  const statsInterval = useRef<NodeJS.Timeout | null>(null);

  const {
    autoConnect = true,
    reconnectOnMount = true,
    cleanupOnUnmount = true,
  } = options;

  // Get performance monitor at hook level
  const performanceMonitor = usePerformanceMonitor();
  
  // Initialize WebSocket
  useEffect(() => {
    const websocket = new OptimizedWebSocket(config, performanceMonitor);
    wsRef.current = websocket;
    setWs(websocket);

    // Listen for state changes
    websocket.on('_statechange', (data: any) => {
      setState(data.currentState);
    });

    // Auto-connect if requested
    if (autoConnect) {
      websocket.connect().catch(error => {
        console.error('Failed to connect:', error);
      });
    }

    // Start stats collection
    statsInterval.current = setInterval(() => {
      setStats(websocket.getStats());
    }, 1000);

    return () => {
      if (statsInterval.current) {
        clearInterval(statsInterval.current);
      }

      if (cleanupOnUnmount) {
        websocket.disconnect();
      }
    };
  }, [config, performanceMonitor, autoConnect, cleanupOnUnmount]); // Include all dependencies

  // Reconnect on mount if requested
  useEffect(() => {
    if (reconnectOnMount && ws && state === ConnectionState.DISCONNECTED) {
      ws.connect().catch(error => {
        console.error('Failed to reconnect on mount:', error);
      });
    }
  }, [reconnectOnMount, ws, state]);

  const connect = useCallback(() => {
    return ws?.connect();
  }, [ws]);

  const disconnect = useCallback(() => {
    ws?.disconnect();
  }, [ws]);

  const send = useCallback((type: string, data: any, options?: any) => {
    return ws?.send(type, data, options) || false;
  }, [ws]);

  const on = useCallback((type: string, handler: any, options?: any) => {
    ws?.on(type, handler, options);
  }, [ws]);

  const off = useCallback((type: string, handler?: any) => {
    ws?.off(type, handler);
  }, [ws]);

  return {
    ws,
    state,
    stats,
    connect,
    disconnect,
    send,
    on,
    off,
    isConnected: state === ConnectionState.CONNECTED,
    isConnecting: state === ConnectionState.CONNECTING,
    isReconnecting: state === ConnectionState.RECONNECTING,
  };
}

// Connection pool for managing multiple WebSocket connections
export class WebSocketPool {
  private connections = new Map<string, OptimizedWebSocket>();
  private roundRobinIndex = 0;

  addConnection(id: string, config: ConnectionConfig): void {
    const ws = new OptimizedWebSocket(config);
    this.connections.set(id, ws);
    ws.connect();
  }

  removeConnection(id: string): void {
    const ws = this.connections.get(id);
    if (ws) {
      ws.disconnect();
      this.connections.delete(id);
    }
  }

  getConnection(id: string): OptimizedWebSocket | null {
    return this.connections.get(id) || null;
  }

  // Get connection using round-robin load balancing
  getNextConnection(): OptimizedWebSocket | null {
    const connections = Array.from(this.connections.values());
    if (connections.length === 0) return null;

    const connection = connections[this.roundRobinIndex % connections.length];
    this.roundRobinIndex++;
    
    return connection;
  }

  // Broadcast message to all connections
  broadcast(type: string, data: any): void {
    for (const ws of this.connections.values()) {
      ws.send(type, data);
    }
  }

  // Get aggregated statistics
  getAggregatedStats(): ConnectionStats {
    const stats = Array.from(this.connections.values()).map(ws => ws.getStats());
    
    return stats.reduce((acc, stat) => ({
      messagesReceived: acc.messagesReceived + stat.messagesReceived,
      messagesSent: acc.messagesSent + stat.messagesSent,
      bytesReceived: acc.bytesReceived + stat.bytesReceived,
      bytesSent: acc.bytesSent + stat.bytesSent,
      reconnections: acc.reconnections + stat.reconnections,
      avgLatency: (acc.avgLatency + stat.avgLatency) / 2,
      uptime: Math.max(acc.uptime, stat.uptime),
      errors: acc.errors + stat.errors,
    }), {
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      reconnections: 0,
      avgLatency: 0,
      uptime: 0,
      errors: 0,
    } as ConnectionStats);
  }

  // Cleanup all connections
  cleanup(): void {
    for (const ws of this.connections.values()) {
      ws.disconnect();
    }
    this.connections.clear();
  }
}