import React from 'react';
import { ConnectionStatus as Status } from '@/lib/socketService';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  RotateCcw
} from 'lucide-react';

export interface ConnectionStatusProps {
  status: Status;
  onReconnect?: () => void;
  className?: string;
  showReconnectButton?: boolean;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({
  status,
  onReconnect,
  className = '',
  showReconnectButton = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case Status.CONNECTED:
        return {
          icon: CheckCircle,
          text: 'Connected',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          variant: 'default' as const,
          showAlert: false
        };

      case Status.CONNECTING:
        return {
          icon: Loader2,
          text: 'Connecting...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          variant: 'default' as const,
          showAlert: true,
          animate: true
        };

      case Status.RECONNECTING:
        return {
          icon: Loader2,
          text: 'Reconnecting...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          variant: 'default' as const,
          showAlert: true,
          animate: true
        };

      case Status.DISCONNECTED:
        return {
          icon: WifiOff,
          text: 'Disconnected',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          variant: 'default' as const,
          showAlert: true
        };

      case Status.ERROR:
        return {
          icon: AlertCircle,
          text: 'Connection Error',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          variant: 'destructive' as const,
          showAlert: true
        };

      default:
        return {
          icon: WifiOff,
          text: 'Unknown Status',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          variant: 'default' as const,
          showAlert: true
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Show alert for non-connected states, compact indicator for connected
  if (config.showAlert && status !== Status.CONNECTED) {
    return (
      <Alert variant={config.variant} className={`${config.bgColor} ${config.borderColor} ${className}`}>
        <Icon className={`h-4 w-4 ${config.animate ? 'animate-spin' : ''}`} />
        <AlertDescription className="flex items-center justify-between">
          <span>{config.text}</span>
          {showReconnectButton && (status === Status.DISCONNECTED || status === Status.ERROR) && onReconnect && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReconnect}
              className="ml-4 h-6 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reconnect
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Icon
        className={`h-4 w-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`}
      />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
      {showReconnectButton && (status === Status.DISCONNECTED || status === Status.ERROR) && onReconnect && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReconnect}
          className="ml-2 h-6 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;