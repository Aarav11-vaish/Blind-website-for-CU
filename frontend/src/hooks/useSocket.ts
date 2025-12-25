import { useEffect, useState, useCallback, useRef } from "react";
import {
  socketService,
  ConnectionStatus,
  CommunityMessage,
  SendMessageData,
  SocketServiceCallbacks,
} from "@/lib/socketService";

export interface UseSocketOptions {
  autoConnect?: boolean;
  serverUrl?: string;
}

export interface UseSocketReturn {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  messages: CommunityMessage[];
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  joinCommunity: (communityId: string) => void;
  leaveCommunity: () => void;
  sendMessage: (messageData: SendMessageData) => Promise<void>;
  reconnect: () => void;
  clearMessages: () => void;
  clearError: () => void;
}

export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
  const { autoConnect = false, serverUrl } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    socketService.getConnectionStatus()
  );
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Callback handlers
  const handleConnectionStatusChange = useCallback(
    (status: ConnectionStatus) => {
      if (!isMountedRef.current) return;

      setConnectionStatus(status);
      setIsConnected(status === ConnectionStatus.CONNECTED);

      // Clear error when successfully connected
      if (status === ConnectionStatus.CONNECTED) {
        setError(null);
      }
    },
    []
  );

  const handleMessageReceived = useCallback((message: CommunityMessage) => {
    if (!isMountedRef.current) return;

    setMessages((prevMessages) => {
      // Avoid duplicate messages
      const messageExists = prevMessages.some((msg) => msg._id === message._id);
      if (messageExists) {
        return prevMessages;
      }

      // Add new message and sort by timestamp
      const updatedMessages = [...prevMessages, message];
      return updatedMessages.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }, []);

  const handleError = useCallback((socketError: Error) => {
    if (!isMountedRef.current) return;

    console.error("Socket error in useSocket:", socketError);
    setError(socketError);
  }, []);

  // Socket service methods
  const connect = useCallback(() => {
    try {
      socketService.connect(serverUrl);
    } catch (err) {
      console.error("Failed to connect:", err);
      setError(err as Error);
    }
  }, [serverUrl]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  const joinCommunity = useCallback((communityId: string) => {
    try {
      socketService.joinCommunity(communityId);
      // Clear previous messages when joining a new community
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error("Failed to join community:", err);
      setError(err as Error);
    }
  }, []);

  const leaveCommunity = useCallback(() => {
    socketService.leaveCommunity();
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (messageData: SendMessageData): Promise<void> => {
      try {
        await socketService.sendMessage(messageData);
        setError(null);
      } catch (err) {
        console.error("Failed to send message:", err);
        const error = err as Error;
        setError(error);
        throw error; // Re-throw so caller can handle it
      }
    },
    []
  );

  const reconnect = useCallback(() => {
    try {
      socketService.reconnect();
      setError(null);
    } catch (err) {
      console.error("Failed to reconnect:", err);
      setError(err as Error);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Setup socket service callbacks
  useEffect(() => {
    const callbacks: SocketServiceCallbacks = {
      onConnectionStatusChange: handleConnectionStatusChange,
      onMessageReceived: handleMessageReceived,
      onError: handleError,
    };

    socketService.setCallbacks(callbacks);

    // Initialize state with current socket service state
    // Use setTimeout to avoid direct setState in effect
    setTimeout(() => {
      setConnectionStatus(socketService.getConnectionStatus());
      setIsConnected(socketService.isConnected());
    }, 0);

    return () => {
      // Clear callbacks when component unmounts
      socketService.setCallbacks({});
    };
  }, [handleConnectionStatusChange, handleMessageReceived, handleError]);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && !socketService.isConnected()) {
      // Use setTimeout to avoid direct setState in effect
      setTimeout(() => connect(), 0);
    }
  }, [autoConnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Don't disconnect the socket service on unmount as it might be used by other components
      // Just clear the callbacks
      socketService.setCallbacks({});
    };
  }, []);

  return {
    connectionStatus,
    isConnected,
    messages,
    error,
    connect,
    disconnect,
    joinCommunity,
    leaveCommunity,
    sendMessage,
    reconnect,
    clearMessages,
    clearError,
  };
};

export default useSocket;
