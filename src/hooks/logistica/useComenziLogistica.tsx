
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { updateComandaStatusDirect } from '@/utils/updateComandaStatusDirect';
import type { Comanda } from '@/types/comanda';

interface ComandaWithStockStatus extends Comanda {
  stockAvailable?: boolean;
}

export function useComenziLogistica() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: comenzi = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['comenzi-logistica'],
    queryFn: async () => {
      console.log('Fetching comenzi for logistica...');
      
      // Simple query to get all orders
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

      // Get real stock data
      const { data: stocuriReale, error: stocuriError } = await supabase
        .rpc('get_stocuri_reale_pentru_produse');

      if (stocuriError) {
        console.error('Error fetching real stock:', stocuriError);
      }

      // Create a map of product ID to real stock for efficient lookup
      const stocuriMap = new Map(
        stocuriReale?.map(item => [item.produs_id, item.stoc_real]) || []
      );

      // Process orders with stock availability check
      const comenziWithDetails = await Promise.all(
        comenziData.map(async (comanda) => {
          // Get order items to check stock availability
          let stockAvailable = true;
          try {
            const { data: itemsData, error: itemsError } = await supabase
              .from('itemi_comanda')
              .select('produs_id, cantitate')
              .eq('comanda_id', comanda.id);

            if (!itemsError && itemsData) {
              // Check if all items have sufficient stock
              stockAvailable = itemsData.every(item => {
                const realStock = stocuriMap.get(item.produs_id) || 0;
                return realStock >= item.cantitate;
              });
            }
          } catch (error) {
            console.warn('Failed to fetch items for stock check:', comanda.id);
            stockAvailable = false;
          }

          return {
            ...comanda,
            stockAvailable
          } as ComandaWithStockStatus;
        })
      );

      console.log('Processed comenzi with stock status:', comenziWithDetails.length);
      
      return comenziWithDetails;
    }
  });

  const updateComandaStatus = async (comandaId: string, newStatus: string, setExpeditionDate: boolean = false, setDeliveryDate: boolean = false) => {
    try {
      console.log('useComenziLogistica: Starting status update for comanda:', comandaId, 'to status:', newStatus);
      
      // Use the direct update utility
      await updateComandaStatusDirect(comandaId, newStatus, setExpeditionDate, setDeliveryDate);

      console.log('useComenziLogistica: Status update successful');

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
      console.error('useComenziLogistica: Error updating comanda status:', error);
      toast({
        title: "Eroare",
        description: `Nu s-a putut actualiza statusul comenzii: ${error?.message || 'Eroare necunoscută'}`,
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
