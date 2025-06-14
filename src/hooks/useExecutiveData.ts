
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Funcția care preia TOATE datele necesare pentru dashboard
const fetchExecutiveData = async () => {
    const { data: comenzi, error: comenziError } = await supabase
        .from('comenzi')
        .select('*, distribuitori(nume_companie), profiluri_utilizatori(full_name)');

    if (comenziError) throw new Error(comenziError.message);
    // Poți adăuga aici și alte surse de date dacă dashboard-ul are nevoie (ex: produse)

    return { comenzi: comenzi || [] };
};

export function useExecutiveData() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['executive_dashboard_data'], // O cheie unică pentru aceste date
        queryFn: fetchExecutiveData,
    });

    // Aici poți adăuga logica de procesare pentru a calcula KPI-urile și datele pentru grafice
    // Acest lucru separă logica de calcul de componenta de afișare.

    return {
        comenzi: data?.comenzi || [],
        isLoading,
        isError,
        error,
    };
}
