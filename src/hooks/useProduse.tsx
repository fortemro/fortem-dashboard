import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Produs {
    id: string;
    nume: string;
    descriere?: string;
    imagine_url?: string;
    categorie?: string;
    greutate_per_bucata?: number;
    bucati_per_bax?: number;
    baxuri_per_palet?: number;
    greutate_bax?: number;
    greutate_palet?: number;
}

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
          setProduse(data as Produs[] || []);
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