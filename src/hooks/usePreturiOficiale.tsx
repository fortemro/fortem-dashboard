
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type PretOficial = Tables<'preturi_oficiale'>;

export function usePreturiOficiale() {
  const [preturi, setPreturi] = useState<PretOficial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreturi();
  }, []);

  const fetchPreturi = async () => {
    try {
      const { data, error } = await supabase
        .from('preturi_oficiale')
        .select(`
          *,
          produse (
            nume,
            cod_produs
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreturi(data || []);
    } catch (error) {
      console.error('Error fetching preturi oficiale:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPreturiFromExcel = async (file: File) => {
    // Pentru moment, vom implementa o funcție simplă
    // În viitor, aceasta poate fi extinsă pentru a procesa fișiere Excel
    console.log('Upload preturi from Excel:', file.name);
    // TODO: Implementare parser Excel
  };

  const validatePrices = async () => {
    try {
      // Query pentru a compara prețurile din comenzi cu cele oficiale
      const { data: comenziCuPreturi, error } = await supabase
        .from('itemi_comanda')
        .select(`
          *,
          produse (
            nume,
            cod_produs
          ),
          comenzi (
            numar_comanda,
            data_comanda,
            mzv_emitent,
            profiluri_utilizatori!comenzi_mzv_emitent_fkey (
              nume,
              prenume
            )
          )
        `);

      if (error) throw error;

      // Pentru fiecare item, căutăm prețul oficial corespunzător
      const validationResults = [];
      
      for (const item of comenziCuPreturi || []) {
        const { data: pretOficial } = await supabase
          .from('preturi_oficiale')
          .select('pret_oficial')
          .eq('produs_id', item.produs_id)
          .lte('data_valabilitate_start', item.comenzi?.data_comanda || new Date().toISOString())
          .or('data_valabilitate_end.is.null,data_valabilitate_end.gte.' + (item.comenzi?.data_comanda || new Date().toISOString()))
          .single();

        if (pretOficial) {
          const diferenta = Math.abs(item.pret_unitar - pretOficial.pret_oficial);
          const procentDiferenta = (diferenta / pretOficial.pret_oficial) * 100;

          if (procentDiferenta > 5) { // Diferență mai mare de 5%
            validationResults.push({
              ...item,
              pret_oficial: pretOficial.pret_oficial,
              diferenta,
              procent_diferenta: procentDiferenta
            });
          }
        }
      }

      return validationResults;
    } catch (error) {
      console.error('Error validating prices:', error);
      return [];
    }
  };

  return {
    preturi,
    loading,
    refreshPreturi: fetchPreturi,
    uploadPreturiFromExcel,
    validatePrices
  };
}
