// src/hooks/useDistribuitori.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Distribuitor } from '@/data-types'; // Folosim tipul central

export function useDistribuitori() {
  const [distribuitori, setDistribuitori] = useState<Distribuitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDistribuitori = useCallback(async () => {
    setLoading(true);
    try {
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

  const findOrCreateDistribuitor = useCallback(async (numeCompanie: string): Promise<string | null> => {
     if (!numeCompanie || !numeCompanie.trim()) {
        console.error("Numele companiei nu poate fi gol.");
        return null;
     }
    
    try {
        const { data: existing } = await supabase
          .from('distribuitori')
          .select('id')
          .eq('nume_companie', numeCompanie.trim())
          .single();

        if (existing) {
          return existing.id;
        }

        const { data: created, error } = await supabase
          .from('distribuitori')
          .insert({ nume_companie: numeCompanie.trim(), adresa: 'N/A', oras: 'N/A' })
          .select('id')
          .single();

        if (error) throw error;
        
        await fetchDistribuitori(); // Reîmprospătăm lista după adăugare
        return created!.id;

    } catch(error: any) {
        // Ignorăm eroarea 'PGRST116' care înseamnă 'not found' și este normală în acest flux
        if (error.code !== 'PGRST116') {
            console.error("Eroare în findOrCreateDistribuitor:", error);
            return null;
        }
        // Dacă eroarea este 'not found', continuăm cu crearea
        const { data: created, error: createError } = await supabase
          .from('distribuitori')
          .insert({ nume_companie: numeCompanie.trim(), adresa: 'N/A', oras: 'N/A' })
          .select('id')
          .single();
        
        if (createError) {
            console.error("Eroare la crearea distribuitorului nou:", createError);
            return null;
        }
        
        await fetchDistribuitori();
        return created!.id;
    }
  }, [fetchDistribuitori]);

  return { distribuitori, loading, findOrCreateDistribuitor };
}