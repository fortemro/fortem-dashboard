
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Comanda } from '@/types/comanda';
import { useToast } from '@/hooks/use-toast';

export function useComenziLogistica() {
  const [comenzi, setComenzi] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComenziLogistica();
  }, []);

  const fetchComenziLogistica = async () => {
    try {
      setLoading(true);
      
      // Fetch comenzi cu status 'in_asteptare'
      const { data: comenziData, error: comenziError } = await supabase
        .from('comenzi')
        .select('*')
        .eq('status', 'in_asteptare')
        .order('created_at', { ascending: false });

      if (comenziError) throw comenziError;

      // Pentru fiecare comandă, obținem detaliile distribuitorului și ale utilizatorului
      const comenziWithDetails = await Promise.all(
        (comenziData || []).map(async (comanda) => {
          // Get distribuitor details
          let distributorDetails = null;
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(comanda.distribuitor_id);
          
          if (isUUID) {
            const { data: distributorData, error: distributorError } = await supabase
              .from('distribuitori')
              .select('*')
              .eq('id', comanda.distribuitor_id)
              .single();

            if (!distributorError && distributorData) {
              distributorDetails = distributorData;
            }
          }

          // Get user profile
          let userProfile = null;
          const { data: profileData, error: profileError } = await supabase
            .from('profiluri_utilizatori')
            .select('nume_complet')
            .eq('user_id', comanda.user_id)
            .single();

          if (!profileError && profileData) {
            userProfile = profileData;
          }

          // Get items pentru această comandă
          const { data: itemsData, error: itemsError } = await supabase
            .from('itemi_comanda')
            .select('*')
            .eq('comanda_id', comanda.id);

          if (itemsError) {
            console.error('Error fetching items for comanda:', comanda.id, itemsError);
          }

          // Calculate total paleti from items
          const calculatedPaleti = (itemsData || []).reduce((total, item) => {
            return total + (item.cantitate || 0);
          }, 0);

          return {
            ...comanda,
            distribuitor: distributorDetails,
            user_profile: userProfile,
            calculated_paleti: calculatedPaleti
          };
        })
      );

      setComenzi(comenziWithDetails);
    } catch (error) {
      console.error('Error fetching comenzi for logistica:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca comenzile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateComandaStatus = async (comandaId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('comenzi')
        .update({ status: newStatus })
        .eq('id', comandaId);

      if (error) throw error;

      // Update local state
      setComenzi(prevComenzi => 
        prevComenzi.map(comanda => 
          comanda.id === comandaId 
            ? { ...comanda, status: newStatus }
            : comanda
        ).filter(comanda => comanda.status === 'in_asteptare') // Remove from list if status changed from 'in_asteptare'
      );

      toast({
        title: "Status actualizat",
        description: "Statusul comenzii a fost actualizat cu succes",
      });

    } catch (error) {
      console.error('Error updating comanda status:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza statusul comenzii",
        variant: "destructive",
      });
    }
  };

  return {
    comenzi,
    loading,
    refreshComenzi: fetchComenziLogistica,
    updateComandaStatus
  };
}
