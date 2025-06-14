
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ComandaGeneral {
  id: string;
  numar_comanda: string;
  data_comanda: string;
  distribuitor_id: string;
  oras_livrare: string;
  status: string;
  total_comanda: number;
  user_id: string;
  distribuitori?: {
    nume_companie: string;
  };
  profiluri_utilizatori?: {
    nume_complet: string;
  };
}

interface Agent {
  user_id: string;
  nume_complet: string;
}

const fetchPanouVanzariData = async () => {
  // Preluăm toate comenzile cu detalii despre distribuitori și utilizatori
  const { data: comenzi, error: comenziError } = await supabase
    .from('comenzi')
    .select(`
      id,
      numar_comanda,
      data_comanda,
      distribuitor_id,
      oras_livrare,
      status,
      total_comanda,
      user_id,
      distribuitori(nume_companie),
      profiluri_utilizatori(nume_complet)
    `)
    .order('data_comanda', { ascending: false });

  if (comenziError) throw new Error(comenziError.message);

  // Preluăm toți agenții unici pentru dropdown
  const { data: agenti, error: agentiError } = await supabase
    .from('profiluri_utilizatori')
    .select('user_id, nume_complet')
    .eq('rol', 'MZV')
    .order('nume_complet');

  if (agentiError) throw new Error(agentiError.message);

  return { 
    comenzi: comenzi || [], 
    agenti: agenti || [] 
  };
};

export function usePanouVanzariData() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['panou_vanzari_data'],
    queryFn: fetchPanouVanzariData,
  });

  return {
    comenzi: data?.comenzi || [],
    agenti: data?.agenti || [],
    isLoading,
    isError,
    error,
  };
}
