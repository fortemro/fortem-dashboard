import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Interfață completă pe baza erorilor de tip din componente
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
    // Câmpuri adăugate pe baza erorilor
    activ?: boolean;
    buc_comanda?: number;
    bucati_per_legatura?: number;
    cod_produs?: string;
    densitate?: number;
    dimensiuni?: string;
    kg_per_buc?: number;
    tip_produs?: string;
    paleti_per_camion?: number;
    kg_per_camion?: number;
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