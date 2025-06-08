import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Produs } from '@/data-types'; // Folosim tipul master, obligatoriu

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
          // --- Transformarea Datelor ---
          // Aici este "magia": transformăm obiectul simplu din DB în obiectul complex așteptat de UI.
          const produseComplete = (data || []).map(p => ({
            // Valori implicite pentru toate câmpurile cerute de UI
            activ: false,
            buc_comanda: 0,
            bucati_per_legatura: 0,
            bucati_per_bax: 0,
            bucati_per_palet: 0,
            cod_produs: '',
            created_at: '',
            densitate: 0,
            descriere: '',
            dimensiuni: '',
            greutate_bax: 0,
            greutate_palet: 0,
            greutate_per_bucata: 0,
            imagine_url: '',
            kg_per_buc: 0,
            kg_per_cam: 0,
            kg_per_camion: 0,
            ml_comanda: 0,
            moneda: 'RON',
            necesare_buc_ml: 0,
            nr_bucati: 0,
            nr_paleti: 0,
            paleti_comandati: 0,
            paleti_per_camion: 0,
            pret: 0,
            pret_unitar: 0,
            stoc_disponibil: 0,
            tip_produs: '',
            unitate_masura: '',
            updated_at: '',
            // Suprascriem valorile implicite cu datele reale din baza de date
            ...p, 
          }));
          setProduse(produseComplete as Produs[]);
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