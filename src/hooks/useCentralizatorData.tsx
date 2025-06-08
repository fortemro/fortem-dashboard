
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { ComandaDetaliata } from '@/types/centralizator';

export function useCentralizatorData() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [comenzi, setComenzi] = useState<ComandaDetaliata[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComenziDetaliate = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch comenzi cu informații de bază
      let query = supabase
        .from('comenzi')
        .select('*')
        .order('created_at', { ascending: false });

      // Dacă nu este Admin, filtrează doar comenzile utilizatorului sau MZV-ului
      if (profile?.rol !== 'Admin') {
        query = query.eq('user_id', user.id);
      }

      const { data: comenziData, error: comenziError } = await query;

      if (comenziError) {
        console.error('Error fetching comenzi:', comenziError);
        throw comenziError;
      }

      // Fetch distribuitori separat pentru a obține informațiile complete
      const { data: distributoriData, error: distributoriError } = await supabase
        .from('distribuitori')
        .select('nume_companie, oras, judet, persoana_contact, telefon');

      if (distributoriError) {
        console.error('Error fetching distribuitori:', distributoriError);
        throw distributoriError;
      }

      // Creează un map pentru distribuitori
      const distributoriMap = new Map();
      distributoriData?.forEach(dist => {
        distributoriMap.set(dist.nume_companie, dist);
      });

      // Fetch items pentru fiecare comandă
      const comenziIds = comenziData?.map(c => c.id) || [];
      
      let itemsData = [];
      if (comenziIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('itemi_comanda')
          .select(`
            id,
            comanda_id,
            cantitate,
            pret_unitar,
            total_item,
            produse!produs_id (
              nume,
              cod_produs,
              dimensiuni
            )
          `)
          .in('comanda_id', comenziIds);

        if (itemsError) {
          console.error('Error fetching items:', itemsError);
          throw itemsError;
        }
        itemsData = items || [];
      }

      // Construiește obiectele detaliate
      const comenziDetaliate: ComandaDetaliata[] = comenziData?.map(comanda => {
        const comandaItems = itemsData.filter(item => item.comanda_id === comanda.id);
        const totalComanda = comandaItems.reduce((sum, item) => sum + (item.total_item || 0), 0);

        // Găsește distribuitor-ul corespunzător sau creează unul implicit
        const distributorInfo = distributoriMap.get(comanda.distribuitor_id) || {
          nume_companie: comanda.distribuitor_id || 'Necunoscut',
          oras: '',
          judet: '',
          persoana_contact: '',
          telefon: ''
        };

        return {
          ...comanda,
          distribuitor: distributorInfo,
          items: comandaItems.map(item => ({
            id: item.id,
            cantitate: item.cantitate,
            pret_unitar: item.pret_unitar,
            total_item: item.total_item,
            produs: item.produse
          })),
          total_comanda: totalComanda
        };
      }) || [];

      setComenzi(comenziDetaliate);
    } catch (error) {
      console.error('Error fetching comenzi detaliate:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchComenziDetaliate();
    }
  }, [user]);

  return {
    comenzi,
    loading,
    fetchComenziDetaliate
  };
}
