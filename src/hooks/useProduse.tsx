import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
// Importăm tipul din fișierul central
import { Produs } from '@/data-types';

export function useProduse() {
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduse = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('produse')
          .select('*')
          .order('nume', { ascending: true });

        if (error) {
          console.error('Eroare la preluarea produselor:', error);
          setProduse([]);
        } else {
          // Adăugăm proprietatea lipsă 'bucati_per_palet' manual pentru compatibilitate
          const produseCompatibile = (data || []).map(p => ({
            ...p,
            bucati_per_palet: p.baxuri_per_palet && p.bucati_per_bax ? p.baxuri_per_palet * p.bucati_per_bax : 0
          }));
          setProduse(produseCompatibile as Produs[]);
        }
      } catch (e) {
        console.error('O excepție a avut loc la preluarea produselor:', e);
        setProduse([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduse();
  }, []);

  return { produse, loading };
}