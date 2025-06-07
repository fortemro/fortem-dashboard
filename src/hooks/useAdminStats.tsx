
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AdminStats {
  totalOrders: number;
  totalValue: number;
  mzvPerformance: Array<{
    mzv_id: string;
    mzv_name: string;
    orders_count: number;
    total_value: number;
  }>;
  distributorStats: Array<{
    distribuitor_id: string;
    distribuitor_name: string;
    orders_count: number;
    total_value: number;
  }>;
  productStats: Array<{
    produs_id: string;
    produs_name: string;
    total_quantity: number;
    total_value: number;
  }>;
}

export function useAdminStats(dateFrom?: string, dateTo?: string) {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAdminStats();
    }
  }, [user, dateFrom, dateTo]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Step 1: Fetch comenzi with basic info
      let comenziQuery = supabase
        .from('comenzi')
        .select('id, data_comanda, mzv_emitent, distribuitor_id, status');

      if (dateFrom) {
        comenziQuery = comenziQuery.gte('data_comanda', dateFrom);
      }
      if (dateTo) {
        comenziQuery = comenziQuery.lte('data_comanda', dateTo);
      }

      const { data: comenzi, error: comenziError } = await comenziQuery;
      if (comenziError) {
        console.error('Error fetching comenzi:', comenziError);
        throw comenziError;
      }

      // Step 2: Fetch distribuitori separat
      const { data: distribuitori, error: distributoriError } = await supabase
        .from('distribuitori')
        .select('nume_companie');

      if (distributoriError) {
        console.error('Error fetching distribuitori:', distributoriError);
        throw distributoriError;
      }

      // Creează un map pentru distribuitori
      const distributoriMap = new Map();
      distribuitori?.forEach(dist => {
        distributoriMap.set(dist.nume_companie, dist.nume_companie);
      });

      // Step 3: Fetch all itemi_comanda for the orders
      const comenziIds = comenzi?.map(c => c.id) || [];
      
      let itemsData = [];
      if (comenziIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('itemi_comanda')
          .select(`
            comanda_id,
            cantitate,
            pret_unitar,
            total_item,
            produs_id,
            produse (
              nume
            )
          `)
          .in('comanda_id', comenziIds);

        if (itemsError) {
          console.error('Error fetching items:', itemsError);
          throw itemsError;
        }
        itemsData = items || [];
      }

      // Step 4: Fetch MZV profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiluri_utilizatori')
        .select('user_id, nume, prenume');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create maps for quick lookup
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.user_id, `${profile.nume} ${profile.prenume}`);
      });

      // Group items by comanda_id for easier lookup
      const itemsByComanda = new Map();
      itemsData.forEach(item => {
        if (!itemsByComanda.has(item.comanda_id)) {
          itemsByComanda.set(item.comanda_id, []);
        }
        itemsByComanda.get(item.comanda_id).push(item);
      });

      // Calculate statistics
      const totalOrders = comenzi?.length || 0;
      
      let totalValue = 0;
      const mzvMap = new Map();
      const distributorMap = new Map();
      const productMap = new Map();

      comenzi?.forEach(comanda => {
        const comandaItems = itemsByComanda.get(comanda.id) || [];
        const comandaValue = comandaItems.reduce((sum, item) => sum + (item.total_item || 0), 0);
        totalValue += comandaValue;

        // MZV Performance
        const mzvId = comanda.mzv_emitent;
        const mzvName = profileMap.get(mzvId) || 'Necunoscut';
        
        if (mzvId) {
          if (mzvMap.has(mzvId)) {
            const existing = mzvMap.get(mzvId);
            existing.orders_count++;
            existing.total_value += comandaValue;
          } else {
            mzvMap.set(mzvId, {
              mzv_id: mzvId,
              mzv_name: mzvName,
              orders_count: 1,
              total_value: comandaValue
            });
          }
        }

        // Distribuitor Stats
        const distributorId = comanda.distribuitor_id;
        const distributorName = distributoriMap.get(distributorId) || distributorId || 'Necunoscut';
        
        if (distributorId) {
          if (distributorMap.has(distributorId)) {
            const existing = distributorMap.get(distributorId);
            existing.orders_count++;
            existing.total_value += comandaValue;
          } else {
            distributorMap.set(distributorId, {
              distribuitor_id: distributorId,
              distribuitor_name: distributorName,
              orders_count: 1,
              total_value: comandaValue
            });
          }
        }

        // Product Stats
        comandaItems.forEach(item => {
          const productId = item.produs_id;
          const productName = item.produse?.nume || 'Necunoscut';
          const quantity = item.cantitate || 0;
          const value = item.total_item || 0;

          if (productId) {
            if (productMap.has(productId)) {
              const existing = productMap.get(productId);
              existing.total_quantity += quantity;
              existing.total_value += value;
            } else {
              productMap.set(productId, {
                produs_id: productId,
                produs_name: productName,
                total_quantity: quantity,
                total_value: value
              });
            }
          }
        });
      });

      setStats({
        totalOrders,
        totalValue,
        mzvPerformance: Array.from(mzvMap.values()).sort((a, b) => b.total_value - a.total_value),
        distributorStats: Array.from(distributorMap.values()).sort((a, b) => b.total_value - a.total_value),
        productStats: Array.from(productMap.values()).sort((a, b) => b.total_value - a.total_value)
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    refreshStats: fetchAdminStats
  };
}
