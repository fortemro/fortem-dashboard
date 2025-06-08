import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Presupunând că ai definit tipurile comenzii undeva centralizat,
// de ex. în src/types/comanda.ts. Dacă nu, acest tip de bază va funcționa.
interface Comanda {
  id: string;
  // Adaugă aici și alte câmpuri ale comenzii dacă este necesar
}

export function useComenzi() {
  const { user } = useAuth();

  /**
   * Prelucrează o singură comandă după ID.
   * Folosește .maybeSingle() pentru a evita erorile în cazul în care nu se găsește nicio înregistrare.
   * Returnează fie datele comenzii, fie null.
   */
  const getComandaById = useCallback(async (id: string): Promise<Comanda | null> => {
    // Verificăm să nu rulăm funcția fără un ID valid.
    if (!id) {
      console.warn('getComandaById a fost apelat fără un ID.');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('comenzi')
        .select(`
          *,
          distribuitori ( nume ),
          comenzi_items ( *, produse ( nume ) )
        `)
        .eq('id', id)
        .maybeSingle(); // Cheia soluției: returnează un singur rând sau null, fără a arunca eroare.

      if (error) {
        // În loc să aruncăm o eroare care blochează tot, o înregistrăm în consolă.
        console.error('Eroare la preluarea comenzii după ID:', error);
        return null;
      }
      
      return data as Comanda | null;

    } catch (e) {
      console.error('O excepție neașteptată a avut loc în getComandaById:', e);
      return null;
    }
  }, []);


  /**
   * Prelucrează toate comenzile pentru utilizatorul curent.
   */
  const getComenzileMele = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('comenzi')
        .select(`
          id,
          created_at,
          status,
          total_general,
          distribuitori ( nume )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Eroare la preluarea comenzilor utilizatorului:', error);
        return [];
      }

      return data;
    } catch (e) {
      console.error('O excepție neașteptată a avut loc în getComenzileMele:', e);
      return [];
    }
  }, [user]);

  // Exportăm funcțiile pentru a fi folosite în alte părți ale aplicației.
  return {
    getComandaById,
    getComenzileMele,
  };
}