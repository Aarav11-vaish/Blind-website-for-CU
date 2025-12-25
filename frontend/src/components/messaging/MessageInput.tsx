import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Send,
  Image as ImageIcon,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { SendMessageData } from '@/lib/socketService';

export interface MessageInputProps {
  onSendMessage: (messageData: SendMessageData) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  maxImages?: number;
  communityId: string;
  userId: string;
  randomName: string;
  className?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 1000,
  maxImages = 4,
  communityId,
  userId,
  randomName,
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isMessageValid = message.trim().length > 0 || images.length > 0;
  const isDisabled = disabled || isSending || isUploading;

  const handleImageUpload = useCallback(async (files: FileList) => {
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const newImages: string[] = [];
      const remainingSlots = maxImages - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      for (const file of filesToProcess) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not a valid image file`);
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        });

        newImages.push(base64);
      }

      setImages(prev => [...prev, ...newImages]);
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  }, [images.length, maxImages]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleSend = async () => {
    if (!isMessageValid || isDisabled) return;

    setIsSending(true);
    setError(null);

    try {
      const messageData: SendMessageData = {
        community_id: communityId,
        user_id: userId,
        randomName: randomName,
        message: message.trim(),
        images: images.length > 0 ? images : undefined
      };

      await onSendMessage(messageData);

      // Clear form on successful send
      setMessage('');
      setImages([]);

      // Focus back to textarea
      textareaRef.current?.focus();
    } catch (err) {
      console.error('Send message error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="h-auto p-1"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Upload preview ${index + 1}`}
                className="h-16 w-16 object-cover rounded-md"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                disabled={isDisabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isDisabled}
            maxLength={maxLength}
            className="min-h-[44px] max-h-32 resize-none pr-12"
            rows={1}
          />

          {/* Character Count */}
          {message.length > maxLength * 0.8 && (
            <div className="absolute bottom-1 right-1 text-xs text-muted-foreground bg-background px-1 rounded">
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Image Upload Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleImageButtonClick}
          disabled={isDisabled || images.length >= maxImages}
          className="h-11 px-3"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!isMessageValid || isDisabled}
          className="h-11 px-4"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Helper Text */}
      <div className="text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
        {images.length > 0 && ` • ${images.length}/${maxImages} images`}
      </div>
    </div>
  );
};

export default MessageInput;