import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { ConnectionStatus, SendMessageData } from '@/lib/socketService';
import ConnectionStatusIndicator from './ConnectionStatus';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageCircle,
  Users,
  RefreshCw,
  AlertCircle,
  ArrowDown
} from 'lucide-react';

export interface CommunityChatProps {
  communityId: string;
  communityName?: string;
  userId: string;
  randomName: string;
  className?: string;
  autoConnect?: boolean;
  maxMessages?: number;
}

const CommunityChat: React.FC<CommunityChatProps> = ({
  communityId,
  communityName = 'Community',
  userId,
  randomName,
  className = '',
  autoConnect = true,
  maxMessages = 100
}) => {
  const {
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
    clearError
  } = useSocket({ autoConnect });

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  // Handle scroll position tracking
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 100;

    setIsAtBottom(isNearBottom);
    setShowScrollButton(!isNearBottom && messages.length > 5);
  }, [messages.length]);

  // Join community when component mounts or communityId changes
  useEffect(() => {
    if (isConnected && communityId && !isInitialized) {
      joinCommunity(communityId);
      // Use a callback to avoid direct setState in effect
      setTimeout(() => setIsInitialized(true), 0);
    }
  }, [isConnected, communityId, joinCommunity, isInitialized]);

  // Auto-scroll to bottom for new messages when user is at bottom
  useEffect(() => {
    if (isAtBottom && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, scrollToBottom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveCommunity();
    };
  }, [leaveCommunity]);

  // Limit messages to prevent memory issues
  const displayMessages = messages.slice(-maxMessages);

  const handleSendMessage = async (messageData: SendMessageData) => {
    try {
      await sendMessage(messageData);
      // Auto-scroll to bottom after sending
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      // Error is already handled by the hook
      throw err;
    }
  };

  const handleReconnect = () => {
    clearError();
    reconnect();
  };

  const handleRefresh = () => {
    clearMessages();
    clearError();
    if (isConnected) {
      leaveCommunity();
      joinCommunity(communityId);
    } else {
      connect();
    }
  };

  const isOwnMessage = (message: any) => {
    return message.user_id === userId;
  };

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>{communityName} Chat</span>
          </CardTitle>

          <div className="flex items-center space-x-2">
            <ConnectionStatusIndicator
              status={connectionStatus}
              onReconnect={handleReconnect}
              showReconnectButton={false}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={connectionStatus === ConnectionStatus.CONNECTING}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Connection Status Alert */}
        {(connectionStatus === ConnectionStatus.DISCONNECTED ||
          connectionStatus === ConnectionStatus.ERROR) && (
            <ConnectionStatusIndicator
              status={connectionStatus}
              onReconnect={handleReconnect}
              className="mt-2"
            />
          )}
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto space-y-4 mb-4 scroll-smooth"
        >
          {/* Loading State */}
          {connectionStatus === ConnectionStatus.CONNECTING && displayMessages.length === 0 && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full max-w-xs" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && connectionStatus !== ConnectionStatus.CONNECTING && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {displayMessages.length === 0 &&
            connectionStatus === ConnectionStatus.CONNECTED &&
            !error && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No messages yet
                </h3>
                <p className="text-muted-foreground">
                  Be the first to start the conversation in {communityName}!
                </p>
              </div>
            )}

          {/* Messages */}
          {displayMessages.map((message) => (
            <MessageItem
              key={message._id}
              message={message}
              isOwnMessage={isOwnMessage(message)}
            />
          ))}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <div className="flex justify-center mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToBottom()}
              className="rounded-full shadow-lg"
            >
              <ArrowDown className="h-4 w-4 mr-1" />
              New messages
            </Button>
          </div>
        )}

        {/* Message Input */}
        <div className="flex-shrink-0">
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!isConnected}
            communityId={communityId}
            userId={userId}
            randomName={randomName}
            placeholder={
              isConnected
                ? `Message ${communityName}...`
                : 'Connecting...'
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityChat;