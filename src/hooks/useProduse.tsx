import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Produs } from '@/types/comanda'; // Reutilizăm tipul dacă există, altfel definim unul local

export function useProduse() {
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduse = async () => {
      setLoading(true);
      try {
        // Presupunem că tabelul se numește 'produse'
        const { data, error } = await supabase
          .from('produse')
          .select('*')
          .order('nume', { ascending: true });

        if (error) {
          console.error('Eroare la preluarea produselor:', error);
          setProduse([]); // Important: returnează o listă goală în caz de eroare
        } else {
          setProduse(data || []); // Asigură-te că nu este null
        }
      } catch (e) {
        console.error('O excepție a avut loc la preluarea produselor:', e);
        setProduse([]); // Asigură stabilitatea
      } finally {
        setLoading(false);
      }
    };

    fetchProduse();
  }, []); // Se execută o singură dată

  return { produse, loading };
}