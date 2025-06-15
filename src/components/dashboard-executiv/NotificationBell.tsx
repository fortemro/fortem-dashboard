
import { useState } from 'react';
import { Bell, BellRing, Check, X, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRealtimeNotifications } from '@/hooks/dashboard-executiv/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useRealtimeNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'critical_stock':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'status_change':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    
    switch (type) {
      case 'new_order':
        return 'bg-blue-50';
      case 'critical_stock':
        return 'bg-red-50';
      case 'status_change':
        return 'bg-green-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notificări</h4>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marchează toate
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearNotifications}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Șterge
              </Button>
            </div>
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} notificări necitite
            </p>
          )}
        </div>
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              Nu există notificări
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationBgColor(notification.type, notification.read)}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium truncate ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                      <p className={`text-xs break-words ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(notification.timestamp, { 
                          addSuffix: true, 
                          locale: ro 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
