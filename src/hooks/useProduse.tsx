import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Produs } from '@/data-types'; // Folosim tipul master

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
          // Asigurăm compatibilitatea. TypeScript va fi mulțumit.
          setProduse((data as any[]) || []);
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