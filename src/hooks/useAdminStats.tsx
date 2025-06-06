
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

      // Construim query-ul cu filtre de dată dacă sunt furnizate
      let query = supabase
        .from('comenzi')
        .select(`
          *,
          itemi_comanda (
            cantitate,
            pret_unitar,
            total_item,
            produse (
              nume
            )
          ),
          distribuitori (
            nume_companie
          ),
          profiluri_utilizatori!comenzi_mzv_emitent_fkey (
            nume,
            prenume
          )
        `);

      if (dateFrom) {
        query = query.gte('data_comanda', dateFrom);
      }
      if (dateTo) {
        query = query.lte('data_comanda', dateTo);
      }

      const { data: comenzi, error } = await query;

      if (error) throw error;

      // Calculăm statisticile
      const totalOrders = comenzi?.length || 0;
      const totalValue = comenzi?.reduce((sum, comanda) => {
        const comandaTotal = comanda.itemi_comanda?.reduce((itemSum: number, item: any) => 
          itemSum + item.total_item, 0) || 0;
        return sum + comandaTotal;
      }, 0) || 0;

      // Performanța MZV-ilor
      const mzvMap = new Map();
      comenzi?.forEach(comanda => {
        const mzvId = comanda.mzv_emitent;
        const mzvName = comanda.profiluri_utilizatori 
          ? `${comanda.profiluri_utilizatori.nume} ${comanda.profiluri_utilizatori.prenume}`
          : 'Necunoscut';
        const comandaValue = comanda.itemi_comanda?.reduce((sum: number, item: any) => 
          sum + item.total_item, 0) || 0;

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
      });

      // Statistici distribuitori
      const distributorMap = new Map();
      comenzi?.forEach(comanda => {
        const distributorId = comanda.distribuitor_id;
        const distributorName = comanda.distribuitori?.nume_companie || 'Necunoscut';
        const comandaValue = comanda.itemi_comanda?.reduce((sum: number, item: any) => 
          sum + item.total_item, 0) || 0;

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
      });

      // Statistici produse
      const productMap = new Map();
      comenzi?.forEach(comanda => {
        comanda.itemi_comanda?.forEach((item: any) => {
          const productId = item.produs_id;
          const productName = item.produse?.nume || 'Necunoscut';
          const quantity = item.cantitate;
          const value = item.total_item;

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
