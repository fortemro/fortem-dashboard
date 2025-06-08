import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Definim un tip local pentru distribuitor
export interface Distribuitor {
  id: string;
  nume: string;
}

export function useDistribuitori() {
  const [distribuitori, setDistribuitori] = useState<Distribuitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistribuitori = async () => {
      setLoading(true);
      try {
        // Presupunem că tabelul se numește 'distribuitori'
        const { data, error } = await supabase
          .from('distribuitori')
          .select('id, nume')
          .order('nume', { ascending: true });

        if (error) {
          console.error('Eroare la preluarea distribuitorilor:', error);
          setDistribuitori([]); // Important: returnează o listă goală în caz de eroare
        } else {
          setDistribuitori(data || []); // Asigură-te că nu este null
        }
      } catch (e) {
        console.error('O excepție a avut loc la preluarea distribuitorilor:', e);
        setDistribuitori([]); // Asigură stabilitatea
      } finally {
        setLoading(false);
      }
    };

    fetchDistribuitori();
  }, []); // Se execută o singură dată

  return { distribuitori, loading };
}