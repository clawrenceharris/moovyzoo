"use client";

import { Wifi, WifiOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";

interface ConnectionStatusProps {
  connected: boolean;
  connecting?: boolean;
  error?: string | null;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}

/**
 * Component to display real-time connection status with visual indicators
 * Shows connected, connecting, or offline states with optional retry functionality
 */
export function ConnectionStatus({
  connected,
  connecting = false,
  error,
  onRetry,
  compact = false,
  className = "",
}: ConnectionStatusProps) {
  const getStatusConfig = () => {
    if (connected) {
      return {
        icon: Wifi,
        text: "Live",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      };
    }

    if (connecting) {
      return {
        icon: Wifi,
        text: "Connecting...",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
      };
    }

    return {
      icon: WifiOff,
      text: "Offline",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    };
  };

  const { icon: Icon, text, color, bgColor } = getStatusConfig();

  if (compact) {
    return (
      <div
        role="status"
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${bgColor} ${className}`}
        title={error || text}
      >
        <Icon className={`h-3 w-3 ${color}`} />
        {connecting && (
          <div className="animate-pulse">
            <div
              className={`h-1 w-1 rounded-full ${color.replace(
                "text-",
                "bg-"
              )}`}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        role="status"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bgColor}`}
      >
        <Icon className={`h-4 w-4 ${color}`} />
        <span className={`text-sm font-medium ${color}`}>{text}</span>
        {connecting && (
          <div className="animate-spin">
            <div
              className={`h-2 w-2 border border-current border-t-transparent rounded-full ${color}`}
            />
          </div>
        )}
      </div>

      {error && !connected && (
        <div className="text-sm text-red-400">{error}</div>
      )}

      {onRetry && !connected && !connecting && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="text-gray-400 hover:text-white"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}
