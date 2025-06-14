
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
  // Preluăm comenzile fără join-uri
  const { data: comenzi, error: comenziError } = await supabase
    .from('comenzi')
    .select('*')
    .order('data_comanda', { ascending: false });

  if (comenziError) throw new Error(comenziError.message);

  // Preluăm toți distribuitorii
  const { data: distribuitori, error: distributoriError } = await supabase
    .from('distribuitori')
    .select('id, nume_companie');

  if (distributoriError) throw new Error(distributoriError.message);

  // Preluăm profilurile utilizatorilor
  const { data: profiluri, error: profituriError } = await supabase
    .from('profiluri_utilizatori')
    .select('user_id, nume_complet');

  if (profituriError) throw new Error(profituriError.message);

  // Preluăm toți agenții unici pentru dropdown
  const { data: agenti, error: agentiError } = await supabase
    .from('profiluri_utilizatori')
    .select('user_id, nume_complet')
    .eq('rol', 'MZV')
    .order('nume_complet');

  if (agentiError) throw new Error(agentiError.message);

  // Combinăm datele manual
  const comenziCombinate = (comenzi || []).map(comanda => {
    // Găsim distribuitor după ID (text sau UUID)
    const distribuitor = (distribuitori || []).find(d => 
      d.id === comanda.distribuitor_id || d.id.toString() === comanda.distribuitor_id
    );
    
    // Găsim profilul utilizatorului
    const profil = (profiluri || []).find(p => p.user_id === comanda.user_id);

    return {
      ...comanda,
      distribuitori: distribuitor ? { nume_companie: distribuitor.nume_companie } : undefined,
      profiluri_utilizatori: profil ? { nume_complet: profil.nume_complet } : undefined
    };
  });

  return { 
    comenzi: comenziCombinate, 
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
