import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Interfață completă pe baza erorilor de tip
export interface Distribuitor {
  id: string;
  nume_companie: string;
  adresa: string;
  oras: string;
  judet?: string;
  cod_fiscal?: string;
  email?: string;
  telefon?: string;
  persoana_contact?: string;
  mzv_alocat?: string;
  activ?: boolean;
}

export function useDistribuitori() {
  const [distribuitori, setDistribuitori] = useState<Distribuitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDistribuitori = useCallback(async () => {
    setLoading(true);
    try {
      // Am corectat `name` în `nume_companie`
      const { data, error } = await supabase
        .from('distribuitori')
        .select('*')
        .order('nume_companie', { ascending: true });

      if (error) {
        console.error('Eroare la preluarea distribuitorilor:', error.message);
        setDistribuitori([]);
      } else {
        setDistribuitori(data || []);
      }
    } catch (e) {
      console.error('Excepție la preluarea distribuitorilor:', e);
      setDistribuitori([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistribuitori();
  }, [fetchDistribuitori]);

  const findOrCreateDistribuitor = useCallback(async (distributorName: string): Promise<string | null> => {
     if (!distributorName.trim()) return null;
    
    try {
        const { data: existing } = await supabase
          .from('distribuitori')
          .select('id')
          .eq('nume_companie', distributorName)
          .single();

        if (existing) return existing.id;
        
        // La creare, adăugăm câmpurile obligatorii cu valori goale
        const { data: created, error } = await supabase
          .from('distribuitori')
          .insert({ nume_companie: distributorName, adresa: 'N/A', oras: 'N/A' })
          .select('id')
          .single();

        if (error) throw error;
        
        await fetchDistribuitori();
        return created!.id;

    } catch(error) {
        console.error("Eroare în findOrCreateDistribuitor:", error);
        return null;
    }
  }, [fetchDistribuitori]);

  return { distribuitori, loading, findOrCreateDistribuitor };
}