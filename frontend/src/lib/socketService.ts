import { io, Socket } from "socket.io-client";

export interface CommunityMessage {
  _id: string;
  community_id: string;
  user_id: string;
  randomName: string;
  message: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  community_id: string;
  user_id: string;
  randomName: string;
  message: string;
  images?: string[];
}

export enum ConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  ERROR = "error",
}

export interface SocketServiceCallbacks {
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  onMessageReceived?: (message: CommunityMessage) => void;
  onError?: (error: Error) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private callbacks: SocketServiceCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private currentCommunityId: string | null = null;

  constructor() {
    // Bind methods to preserve context
    this.handleConnect = this.handleConnect.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
    this.handleReconnect = this.handleReconnect.bind(this);
    this.handleReconnectAttempt = this.handleReconnectAttempt.bind(this);
    this.handleReconnectError = this.handleReconnectError.bind(this);
    this.handleMessageReceived = this.handleMessageReceived.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  /**
   * Initialize socket connection
   */
  public connect(
    serverUrl: string = process.env.NEXT_PUBLIC_SOCKET_URL ||
      "http://localhost:5000"
  ): void {
    if (this.socket?.connected) {
      return;
    }

    this.setConnectionStatus(ConnectionStatus.CONNECTING);

    try {
      this.socket = io(serverUrl, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: this.maxReconnectDelay,
        forceNew: false,
        autoConnect: true,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize socket connection:", error);
      this.setConnectionStatus(ConnectionStatus.ERROR);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Disconnect from socket server
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
    this.currentCommunityId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Join a community chat room
   */
  public joinCommunity(communityId: string): void {
    if (!this.socket?.connected) {
      console.warn("Socket not connected. Cannot join community.");
      return;
    }

    // Leave previous community if any
    if (this.currentCommunityId && this.currentCommunityId !== communityId) {
      this.leaveCommunity();
    }

    this.currentCommunityId = communityId;
    this.socket.emit("join_community", communityId);
  }

  /**
   * Leave current community chat room
   */
  public leaveCommunity(): void {
    if (this.currentCommunityId && this.socket?.connected) {
      // Note: Backend doesn't have leave_community event, but we track it locally
    }
    this.currentCommunityId = null;
  }

  /**
   * Send a message to the current community
   */
  public sendMessage(messageData: SendMessageData): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      if (!this.currentCommunityId) {
        reject(new Error("Not joined to any community"));
        return;
      }

      try {
        this.socket.emit("send_message", messageData);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Check if socket is connected
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get current community ID
   */
  public getCurrentCommunityId(): string | null {
    return this.currentCommunityId;
  }

  /**
   * Set callbacks for socket events
   */
  public setCallbacks(callbacks: SocketServiceCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Manual reconnection attempt
   */
  public reconnect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.disconnect();
    this.connect();
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", this.handleConnect);
    this.socket.on("disconnect", this.handleDisconnect);
    this.socket.on("reconnect", this.handleReconnect);
    this.socket.on("reconnect_attempt", this.handleReconnectAttempt);
    this.socket.on("reconnect_error", this.handleReconnectError);
    this.socket.on("received_message", this.handleMessageReceived);
    this.socket.on("connect_error", this.handleError);
    this.socket.on("error", this.handleError);
  }

  /**
   * Handle successful connection
   */
  private handleConnect(): void {
    this.setConnectionStatus(ConnectionStatus.CONNECTED);
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000; // Reset delay

    // Rejoin community if we were in one
    if (this.currentCommunityId) {
      this.joinCommunity(this.currentCommunityId);
    }
  }

  /**
   * Handle disconnection
   */
  private handleDisconnect(reason: string): void {
    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);

    // If disconnection was not intentional, attempt to reconnect
    if (reason === "io server disconnect") {
      // Server initiated disconnect, don't reconnect automatically
      return;
    }

    this.attemptReconnection();
  }

  /**
   * Handle successful reconnection
   */
  private handleReconnect(): void {
    this.setConnectionStatus(ConnectionStatus.CONNECTED);
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000; // Reset delay
  }

  /**
   * Handle reconnection attempt
   */
  private handleReconnectAttempt(): void {
    this.reconnectAttempts++;
    this.setConnectionStatus(ConnectionStatus.RECONNECTING);
  }

  /**
   * Handle reconnection error
   */
  private handleReconnectError(error: Error): void {
    console.error("Reconnection failed:", error);

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      this.setConnectionStatus(ConnectionStatus.ERROR);
      this.callbacks.onError?.(
        new Error("Failed to reconnect after maximum attempts")
      );
    }
  }

  /**
   * Handle received message
   */
  private handleMessageReceived(message: CommunityMessage): void {
    this.callbacks.onMessageReceived?.(message);
  }

  /**
   * Handle socket errors
   */
  private handleError(error: Error): void {
    console.error("Socket error:", error);
    this.setConnectionStatus(ConnectionStatus.ERROR);
    this.callbacks.onError?.(error);
  }

  /**
   * Attempt reconnection with exponential backoff
   */
  private attemptReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      this.setConnectionStatus(ConnectionStatus.ERROR);
      return;
    }

    this.setConnectionStatus(ConnectionStatus.RECONNECTING);

    this.reconnectTimer = setTimeout(() => {
      if (!this.socket?.connected) {
        this.reconnectAttempts++;

        // Exponential backoff
        this.reconnectDelay = Math.min(
          this.reconnectDelay * 2,
          this.maxReconnectDelay
        );

        this.connect();
      }
    }, this.reconnectDelay);
  }

  /**
   * Set connection status and notify callbacks
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.callbacks.onConnectionStatusChange?.(status);
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
