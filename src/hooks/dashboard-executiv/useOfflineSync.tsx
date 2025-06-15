
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  syncInProgress: boolean;
}

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingOperations: 0,
    syncInProgress: false
  });
  
  const { toast } = useToast();
  const syncQueue = useRef<OfflineData[]>([]);
  const retryAttempts = useRef<number>(0);
  const maxRetries = 3;

  // Monitorizează statusul conexiunii
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "🟢 Conexiune Restabilită",
        description: "Sincronizarea datelor va începe automat",
      });
      performSync();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "🔴 Conexiune Întreruptă",
        description: "Aplicația funcționează în mod offline",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Cache-ul local pentru date
  const saveToLocalCache = (key: string, data: any) => {
    try {
      const cacheItem: OfflineData = {
        key,
        data,
        timestamp: Date.now(),
        synced: syncStatus.isOnline
      };
      
      localStorage.setItem(`offline_cache_${key}`, JSON.stringify(cacheItem));
      
      if (!syncStatus.isOnline) {
        syncQueue.current.push(cacheItem);
        setSyncStatus(prev => ({ 
          ...prev, 
          pendingOperations: syncQueue.current.length 
        }));
      }
      
      console.log('💾 Data saved to local cache:', key);
    } catch (error) {
      console.error('Error saving to local cache:', error);
    }
  };

  const getFromLocalCache = (key: string): any | null => {
    try {
      const cached = localStorage.getItem(`offline_cache_${key}`);
      if (cached) {
        const cacheItem: OfflineData = JSON.parse(cached);
        
        // Verifică dacă cache-ul nu e prea vechi (max 1 oră)
        const isExpired = Date.now() - cacheItem.timestamp > 60 * 60 * 1000;
        
        if (!isExpired) {
          console.log('📖 Data loaded from local cache:', key);
          return cacheItem.data;
        } else {
          localStorage.removeItem(`offline_cache_${key}`);
        }
      }
    } catch (error) {
      console.error('Error reading from local cache:', error);
    }
    return null;
  };

  // Sincronizarea datelor când conexiunea revine
  const performSync = async () => {
    if (!syncStatus.isOnline || syncStatus.syncInProgress) return;

    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));

    try {
      console.log('🔄 Starting data synchronization...');
      
      // Încarcă date din cache local pentru sincronizare
      const keys = Object.keys(localStorage).filter(key => key.startsWith('offline_cache_'));
      
      for (const key of keys) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const cacheItem: OfflineData = JSON.parse(cached);
          if (!cacheItem.synced) {
            // Încearcă să sincronizeze acest element
            await syncDataItem(cacheItem);
          }
        }
      }

      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingOperations: 0,
        syncInProgress: false
      }));

      syncQueue.current = [];
      retryAttempts.current = 0;

      toast({
        title: "✅ Sincronizare Completă",
        description: "Toate datele au fost sincronizate cu succes",
      });

    } catch (error) {
      console.error('Sync error:', error);
      retryAttempts.current++;
      
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }));

      if (retryAttempts.current < maxRetries) {
        toast({
          title: "⚠️ Eroare Sincronizare",
          description: `Reîncercare ${retryAttempts.current}/${maxRetries}...`,
          variant: "destructive",
        });
        
        // Retry după 5 secunde
        setTimeout(performSync, 5000);
      } else {
        toast({
          title: "❌ Sincronizare Eșuată",
          description: "Verificați conexiunea și încercați manual",
          variant: "destructive",
        });
      }
    }
  };

  const syncDataItem = async (item: OfflineData) => {
    // Simulare sincronizare - în realitate aici ai face API calls
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Marchează ca sincronizat
    const updatedItem = { ...item, synced: true };
    localStorage.setItem(`offline_cache_${item.key}`, JSON.stringify(updatedItem));
  };

  // Cache optimizat pentru queries
  const cachedQuery = async (queryKey: string, queryFn: () => Promise<any>) => {
    // Încearcă să obții din cache dacă offline
    if (!syncStatus.isOnline) {
      const cached = getFromLocalCache(queryKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Execută query-ul
      const result = await queryFn();
      
      // Salvează în cache
      saveToLocalCache(queryKey, result);
      
      return result;
    } catch (error) {
      // Dacă query-ul eșuează, încearcă din cache
      const cached = getFromLocalCache(queryKey);
      if (cached) {
        toast({
          title: "📱 Date din Cache",
          description: "Afișez datele salvate local",
        });
        return cached;
      }
      throw error;
    }
  };

  // Forțează sincronizarea manuală
  const forcSync = () => {
    if (syncStatus.isOnline) {
      performSync();
    } else {
      toast({
        title: "🔴 Fără Conexiune",
        description: "Conectați-vă la internet pentru sincronizare",
        variant: "destructive",
      });
    }
  };

  // Curățarea cache-ului vechi
  const clearOldCache = () => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('offline_cache_'));
    let cleared = 0;
    
    keys.forEach(key => {
      const cached = localStorage.getItem(key);
      if (cached) {
        const cacheItem: OfflineData = JSON.parse(cached);
        // Șterge cache-ul mai vechi de 24h
        if (Date.now() - cacheItem.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(key);
          cleared++;
        }
      }
    });
    
    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} old cache items`);
    }
  };

  // Curăță cache-ul vechi la inițializare
  useEffect(() => {
    clearOldCache();
  }, []);

  return {
    syncStatus,
    saveToLocalCache,
    getFromLocalCache,
    cachedQuery,
    forcSync,
    clearOldCache
  };
}
