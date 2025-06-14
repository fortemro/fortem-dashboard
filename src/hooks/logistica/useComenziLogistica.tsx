
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Comanda } from '@/types/comanda';

export function useComenziLogistica() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: comenzi = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['comenzi-logistica'],
    queryFn: async () => {
      console.log('Fetching comenzi for logistica...');
      
      // First get all orders
      const { data: comenziData, error: comenziError } = await supabase
        .from('comenzi')
        .select('*')
        .order('data_comanda', { ascending: false });

      if (comenziError) {
        console.error('Error fetching comenzi:', comenziError);
        throw comenziError;
      }

      console.log('Found comenzi:', comenziData?.length || 0);

      if (!comenziData) return [];

      // Then get distributor details for each order if the distribuitor_id is a UUID
      const comenziWithDistributors = await Promise.all(
        comenziData.map(async (comanda) => {
          let distributorDetails = null;
          
          // Check if distribuitor_id is a UUID
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(comanda.distribuitor_id);
          
          if (isUUID) {
            try {
              const { data: distributorData, error: distributorError } = await supabase
                .from('distribuitori')
                .select('*')
                .eq('id', comanda.distribuitor_id)
                .single();

              // Only set distributorDetails if no error and data exists
              if (!distributorError && distributorData) {
                distributorDetails = distributorData;
              } else if (distributorError && distributorError.code !== 'PGRST116') {
                // Log only if it's not a "no rows found" error
                console.warn('Error fetching distributor:', distributorError);
              }
            } catch (error) {
              // Silently handle distributor fetch errors
              console.warn('Failed to fetch distributor for comanda:', comanda.id);
            }
          }

          return {
            ...comanda,
            distribuitor: distributorDetails
          };
        })
      );

      console.log('Processed comenzi with distributors:', comenziWithDistributors.length);
      
      return comenziWithDistributors as Comanda[];
    }
  });

  const updateComandaStatus = async (comandaId: string, newStatus: string, setExpeditionDate: boolean = false, setDeliveryDate: boolean = false) => {
    try {
      console.log('Updating comanda status:', comandaId, 'to:', newStatus);
      
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // If marking as 'in_tranzit' (expediated), set the expedition date
      if (setExpeditionDate && newStatus === 'in_tranzit') {
        updateData.data_expediere = new Date().toISOString();
      }

      // If marking as 'livrata' (delivered), set the delivery date
      if (setDeliveryDate && newStatus === 'livrata') {
        updateData.data_livrare = new Date().toISOString();
      }

      const { error } = await supabase
        .from('comenzi')
        .update(updateData)
        .eq('id', comandaId);

      if (error) throw error;

      // Invalidate and refetch the query
      queryClient.invalidateQueries({ queryKey: ['comenzi-logistica'] });
      queryClient.invalidateQueries({ queryKey: ['logistica-stats'] });

      let successMessage = `Statusul comenzii a fost schimbat în "${newStatus}"`;
      if (setExpeditionDate) {
        successMessage += ' și data expedierii a fost înregistrată';
      }
      if (setDeliveryDate) {
        successMessage += ' și data livrării a fost înregistrată';
      }

      toast({
        title: "Status actualizat",
        description: successMessage
      });
    } catch (error) {
      console.error('Error updating comanda status:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza statusul comenzii",
        variant: "destructive"
      });
    }
  };

  return {
    comenzi,
    loading,
    updateComandaStatus,
    refetch
  };
}
