
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { AdminStats } from '@/types/adminStats';
import { useAdminStatsData } from './adminStats/useAdminStatsData';
import { createLookupMaps, groupItemsByComanda, calculateStats } from './adminStats/adminStatsCalculators';

export function useAdminStats(dateFrom?: string, dateTo?: string) {
  const { user } = useAuth();
  const { fetchComenzi, fetchDistribuitori, fetchItemsForComenzi, fetchProfiles } = useAdminStatsData();
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

      // Fetch all required data
      const [comenzi, distribuitori, profiles] = await Promise.all([
        fetchComenzi(dateFrom, dateTo),
        fetchDistribuitori(),
        fetchProfiles()
      ]);

      // Fetch items for all orders
      const comenziIds = comenzi?.map(c => c.id) || [];
      const itemsData = await fetchItemsForComenzi(comenziIds);

      // Create lookup maps
      const { distributoriMap, profileMap } = createLookupMaps(distribuitori, profiles);

      // Group items by order
      const itemsByComanda = groupItemsByComanda(itemsData);

      // Calculate statistics
      const calculatedStats = calculateStats(comenzi, itemsByComanda, distributoriMap, profileMap);

      setStats(calculatedStats);

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
