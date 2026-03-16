import { Bell, Check, CheckCheck, Info, AlertTriangle, ShieldAlert, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  alert: <ShieldAlert className="h-4 w-4 text-destructive" />,
  message: <MessageSquare className="h-4 w-4 text-primary" />,
};

const NotificationItem = ({
  notification,
  onRead,
  onNavigate,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onNavigate: (link: string) => void;
}) => {
  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
    if (notification.link) {
      onNavigate(notification.link);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-border/50 hover:bg-secondary/50 transition-colors flex gap-3 items-start",
        !notification.is_read && "bg-primary/5"
      )}
    >
      <div className="mt-0.5 shrink-0">
        {typeIcons[notification.type] || typeIcons.info}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm truncate", !notification.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="shrink-0 h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[11px] text-muted-foreground/70 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
};

export const NotificationsDropdown = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-secondary rounded-lg">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={(id) => markAsRead.mutate(id)}
                onNavigate={(link) => navigate(link)}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
