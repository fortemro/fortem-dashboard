
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeNotification {
  id: string;
  type: 'new_order' | 'critical_stock' | 'status_change';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface UseRealtimeNotificationsReturn {
  notifications: RealtimeNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export function useRealtimeNotifications(): UseRealtimeNotificationsReturn {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    console.log('🔔 Initializing realtime notifications...');
    
    // Ascultă pentru comenzi noi
    const comenziChannel = supabase
      .channel('comenzi-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comenzi'
        },
        (payload) => {
          console.log('📦 New order detected:', payload);
          const newNotification: RealtimeNotification = {
            id: `order_${payload.new.id}_${Date.now()}`,
            type: 'new_order',
            title: 'Comandă Nouă',
            message: `Comandă #${payload.new.numar_comanda} de la ${payload.new.distribuitor_id}`,
            timestamp: new Date(),
            read: false,
            data: payload.new
          };
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Păstrează max 20
          
          toast({
            title: "📦 Comandă Nouă",
            description: `Comandă #${payload.new.numar_comanda} a fost creată`,
            variant: "default",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comenzi'
        },
        (payload) => {
          if (payload.old.status !== payload.new.status) {
            console.log('📊 Order status changed:', payload);
            const newNotification: RealtimeNotification = {
              id: `status_${payload.new.id}_${Date.now()}`,
              type: 'status_change',
              title: 'Status Comandă Actualizat',
              message: `Comanda #${payload.new.numar_comanda}: ${payload.old.status} → ${payload.new.status}`,
              timestamp: new Date(),
              read: false,
              data: payload.new
            };
            
            setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
            
            if (payload.new.status === 'expedita' || payload.new.status === 'livrata') {
              toast({
                title: "📊 Status Actualizat",
                description: `Comanda #${payload.new.numar_comanda} este ${payload.new.status}`,
                variant: "default",
              });
            }
          }
        }
      )
      .subscribe();

    // Ascultă pentru actualizări de stoc critice
    const stocChannel = supabase
      .channel('stoc-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'produse'
        },
        (payload) => {
          const oldStock = payload.old.stoc_disponibil;
          const newStock = payload.new.stoc_disponibil;
          const threshold = payload.new.prag_alerta_stoc;
          
          // Detectează dacă stocul a scăzut sub pragul critic
          if (oldStock > threshold && newStock <= threshold) {
            console.log('🚨 Critical stock detected:', payload);
            const newNotification: RealtimeNotification = {
              id: `stock_${payload.new.id}_${Date.now()}`,
              type: 'critical_stock',
              title: 'Alertă Stoc Critic',
              message: `${payload.new.nume} - Stoc scăzut: ${newStock} unități`,
              timestamp: new Date(),
              read: false,
              data: payload.new
            };
            
            setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
            
            toast({
              title: "🚨 Alertă Stoc",
              description: `${payload.new.nume} are stoc critic: ${newStock} unități`,
              variant: "destructive",
            });
          }
          
          // Detectează stoc ZERO
          if (oldStock > 0 && newStock === 0) {
            console.log('💥 Stock ZERO detected:', payload);
            const newNotification: RealtimeNotification = {
              id: `zero_${payload.new.id}_${Date.now()}`,
              type: 'critical_stock',
              title: 'STOC EPUIZAT',
              message: `${payload.new.nume} - STOC ZERO!`,
              timestamp: new Date(),
              read: false,
              data: payload.new
            };
            
            setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
            
            toast({
              title: "💥 STOC EPUIZAT",
              description: `${payload.new.nume} nu mai are stoc disponibil!`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    channelRef.current = { comenziChannel, stocChannel };

    return () => {
      console.log('🔇 Cleaning up realtime notifications...');
      comenziChannel.unsubscribe();
      stocChannel.unsubscribe();
    };
  }, [toast]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
}
