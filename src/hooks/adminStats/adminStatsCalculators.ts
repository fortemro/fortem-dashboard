
import { AdminStats, ComandaWithItems, ItemComanda, ProfileData } from '@/types/adminStats';

export const createLookupMaps = (
  distribuitori: any[],
  profiles: ProfileData[]
) => {
  const distributoriMap = new Map();
  distribuitori?.forEach(dist => {
    distributoriMap.set(dist.nume_companie, dist.nume_companie);
  });

  const profileMap = new Map();
  profiles?.forEach(profile => {
    profileMap.set(profile.user_id, `${profile.nume} ${profile.prenume}`);
  });

  return { distributoriMap, profileMap };
};

export const groupItemsByComanda = (items: ItemComanda[]) => {
  const itemsByComanda = new Map();
  items.forEach(item => {
    if (!itemsByComanda.has(item.comanda_id)) {
      itemsByComanda.set(item.comanda_id, []);
    }
    itemsByComanda.get(item.comanda_id).push(item);
  });
  return itemsByComanda;
};

export const calculateStats = (
  comenzi: ComandaWithItems[],
  itemsByComanda: Map<string, ItemComanda[]>,
  distributoriMap: Map<string, string>,
  profileMap: Map<string, string>
): AdminStats => {
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

  return {
    totalOrders,
    totalValue,
    mzvPerformance: Array.from(mzvMap.values()).sort((a, b) => b.total_value - a.total_value),
    distributorStats: Array.from(distributorMap.values()).sort((a, b) => b.total_value - a.total_value),
    productStats: Array.from(productMap.values()).sort((a, b) => b.total_value - a.total_value)
  };
};
