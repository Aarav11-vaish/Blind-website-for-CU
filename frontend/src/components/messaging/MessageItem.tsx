import React from 'react';
import { CommunityMessage } from '@/lib/socketService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { User, Image as ImageIcon } from 'lucide-react';

export interface MessageItemProps {
  message: CommunityMessage;
  isOwnMessage?: boolean;
  className?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage = false,
  className = ''
}) => {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown time';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`flex space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''} ${className}`}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {message.randomName ? getInitials(message.randomName) : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwnMessage ? 'text-right' : ''}`}>
        {/* Header */}
        <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
          <span className="text-sm font-medium text-foreground">
            {message.randomName || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.createdAt)}
          </span>
        </div>

        {/* Message Text */}
        {message.message && (
          <div className={`
            inline-block px-3 py-2 rounded-lg max-w-xs sm:max-w-md break-words
            ${isOwnMessage
              ? 'bg-primary text-primary-foreground ml-auto'
              : 'bg-muted text-foreground'
            }
          `}>
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          </div>
        )}

        {/* Images */}
        {message.images && message.images.length > 0 && (
          <div className={`mt-2 ${isOwnMessage ? 'flex justify-end' : ''}`}>
            <div className="grid gap-2 max-w-xs sm:max-w-md">
              {message.images.length === 1 ? (
                <div className="relative">
                  <img
                    src={message.images[0]}
                    alt="Message attachment"
                    className="rounded-lg max-h-48 w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(message.images[0], '_blank')}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // Show fallback
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div
                    className="hidden items-center justify-center bg-muted rounded-lg h-24 w-24 cursor-pointer"
                    onClick={() => window.open(message.images[0], '_blank')}
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <div className={`grid gap-1 ${message.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {message.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Message attachment ${index + 1}`}
                        className="rounded-md h-20 w-20 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(image, '_blank')}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show fallback
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div
                        className="hidden items-center justify-center bg-muted rounded-md h-20 w-20 cursor-pointer"
                        onClick={() => window.open(image, '_blank')}
                      >
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {index === 3 && message.images.length > 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            +{message.images.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;