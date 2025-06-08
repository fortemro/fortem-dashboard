
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Distribuitor = Tables<'distribuitori'>;
type DistribuitorInsert = TablesInsert<'distribuitori'>;

export function useDistribuitori(filterByUser = false) {
  const { user } = useAuth();
  const [distribuitori, setDistribuitori] = useState<Distribuitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistribuitori();
  }, [user, filterByUser]);

  const fetchDistribuitori = async () => {
    try {
      let query = supabase
        .from('distribuitori')
        .select('*')
        .eq('activ', true);

      // Filtrează după utilizatorul logat dacă este cerut
      if (filterByUser && user) {
        query = query.eq('mzv_alocat', user.id);
      }

      const { data, error } = await query.order('nume_companie');

      if (error) throw error;
      setDistribuitori(data || []);
    } catch (error) {
      console.error('Error fetching distribuitori:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDistribuitor = async (distributorData: {
    nume_companie: string;
    oras?: string;
    adresa?: string;
    judet?: string;
    telefon?: string;
    email?: string;
    persoana_contact?: string;
  }) => {
    if (!user) throw new Error('Nu ești autentificat');

    try {
      const insertData: Omit<DistribuitorInsert, 'id' | 'created_at' | 'updated_at'> = {
        nume_companie: distributorData.nume_companie.trim(),
        oras: distributorData.oras || 'Necunoscut',
        adresa: distributorData.adresa || 'Adresă necunoscută',
        judet: distributorData.judet || null,
        telefon: distributorData.telefon || null,
        email: distributorData.email || null,
        persoana_contact: distributorData.persoana_contact || null,
        mzv_alocat: user.id,
        activ: true
      };

      const { data: distribuitor, error } = await supabase
        .from('distribuitori')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      await fetchDistribuitori();
      return distribuitor;
    } catch (error) {
      console.error('Error creating distribuitor:', error);
      throw error;
    }
  };

  const findOrCreateDistribuitor = async (numeCompanie: string) => {
    if (!user) throw new Error('Nu ești autentificat');

    try {
      // Căută distribuitor existent
      const { data: existingDistribuitor } = await supabase
        .from('distribuitori')
        .select('*')
        .ilike('nume_companie', numeCompanie.trim())
        .single();

      if (existingDistribuitor) {
        return existingDistribuitor;
      }

      // Creează distribuitor nou dacă nu există
      return await createDistribuitor({
        nume_companie: numeCompanie.trim()
      });
    } catch (error) {
      console.error('Error finding or creating distribuitor:', error);
      throw error;
    }
  };

  return {
    distribuitori,
    loading,
    createDistribuitor,
    findOrCreateDistribuitor,
    refreshDistribuitori: fetchDistribuitori
  };
}
