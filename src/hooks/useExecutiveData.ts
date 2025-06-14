
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ComandaExecutive {
  id: string;
  numar_comanda: string;
  status: string;
  total_comanda: number;
  data_comanda: string;
  distribuitor_id: string;
  user_id: string;
}

interface UtilizatorExecutive {
  id: string;
  nume_complet: string;
  rol: string;
  email: string;
}

interface ExecutiveData {
  comenzi: ComandaExecutive[];
  utilizatori: UtilizatorExecutive[];
  isLoading: boolean;
  error: string | null;
}

export function useExecutiveData(): ExecutiveData {
  const { user } = useAuth();
  const [comenzi, setComenzi] = useState<ComandaExecutive[]>([]);
  const [utilizatori, setUtilizatori] = useState<UtilizatorExecutive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      // Reset data if no user
      setComenzi([]);
      setUtilizatori([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch comenzi în paralel cu utilizatori pentru performanță mai bună
      const [comenziResult, utilizatoriResult] = await Promise.allSettled([
        fetchComenzi(),
        fetchUtilizatori()
      ]);

      // Procesează rezultatele comenzilor
      if (comenziResult.status === 'fulfilled') {
        setComenzi(comenziResult.value);
      } else {
        console.error('Eroare la preluarea comenzilor:', comenziResult.reason);
        setComenzi([]); // Asigură listă validă chiar și în caz de eroare
      }

      // Procesează rezultatele utilizatorilor
      if (utilizatoriResult.status === 'fulfilled') {
        setUtilizatori(utilizatoriResult.value);
      } else {
        console.error('Eroare la preluarea utilizatorilor:', utilizatoriResult.reason);
        setUtilizatori([]); // Asigură listă validă chiar și în caz de eroare
      }

      // Setează eroarea doar dacă ambele au eșuat
      if (comenziResult.status === 'rejected' && utilizatoriResult.status === 'rejected') {
        setError('Eroare la preluarea datelor. Vă rugăm să reîncărcați pagina.');
      }

    } catch (error) {
      console.error('Eroare generală la preluarea datelor executive:', error);
      setError('Eroare la preluarea datelor. Vă rugăm să reîncărcați pagina.');
      // Asigură liste valide chiar și în caz de eroare
      setComenzi([]);
      setUtilizatori([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComenzi = async (): Promise<ComandaExecutive[]> => {
    try {
      const { data, error } = await supabase
        .from('comenzi')
        .select(`
          id,
          numar_comanda,
          status,
          total_comanda,
          data_comanda,
          distribuitor_id,
          user_id
        `)
        .order('data_comanda', { ascending: false });

      if (error) {
        throw new Error(`Eroare Supabase comenzi: ${error.message}`);
      }

      // Asigură că returnăm întotdeauna o listă validă
      return data?.map(comanda => ({
        id: comanda.id,
        numar_comanda: comanda.numar_comanda || '',
        status: comanda.status || 'necunoscut',
        total_comanda: Number(comanda.total_comanda) || 0,
        data_comanda: comanda.data_comanda || new Date().toISOString(),
        distribuitor_id: comanda.distribuitor_id || '',
        user_id: comanda.user_id || ''
      })) || [];

    } catch (error) {
      console.error('Eroare la preluarea comenzilor:', error);
      throw error;
    }
  };

  const fetchUtilizatori = async (): Promise<UtilizatorExecutive[]> => {
    try {
      // Preluăm utilizatorii din tabelul profiluri_utilizatori
      const { data, error } = await supabase
        .from('profiluri_utilizatori')
        .select(`
          user_id,
          nume_complet,
          rol
        `);

      if (error) {
        throw new Error(`Eroare Supabase utilizatori: ${error.message}`);
      }

      // Asigură că returnăm întotdeauna o listă validă
      return data?.map(utilizator => ({
        id: utilizator.user_id,
        nume_complet: utilizator.nume_complet || 'Utilizator necunoscut',
        rol: utilizator.rol || 'Rol necunoscut',
        email: '' // Email-ul nu este disponibil în profiluri_utilizatori
      })) || [];

    } catch (error) {
      console.error('Eroare la preluarea utilizatorilor:', error);
      throw error;
    }
  };

  // Funcție pentru reîncărcarea datelor
  const refreshData = () => {
    if (user) {
      fetchAllData();
    }
  };

  return {
    comenzi,
    utilizatori,
    isLoading,
    error,
    refreshData
  } as ExecutiveData & { refreshData: () => void };
}
