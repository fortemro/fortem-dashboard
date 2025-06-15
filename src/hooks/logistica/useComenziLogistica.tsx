
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { updateComandaStatusDirect } from '@/utils/updateComandaStatusDirect';
import type { Comanda } from '@/types/comanda';

interface ComandaWithStockStatus extends Comanda {
  stockAvailable?: boolean;
  distribuitor_nume?: string;
}

export function useComenziLogistica() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: comenzi = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['comenzi-logistica'],
    queryFn: async () => {
      console.log('Fetching comenzi for logistica...');
      
      // Query orders and distributors separately, then join them
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

      // Get distributors data
      const { data: distribuitori, error: distributoriError } = await supabase
        .from('distribuitori')
        .select('id, nume_companie');

      if (distributoriError) {
        console.error('Error fetching distribuitori:', distributoriError);
      }

      // Create maps for both UUID and name matching
      const distributoriByIdMap = new Map(
        distribuitori?.map(d => [d.id, d.nume_companie]) || []
      );
      const distributoriByNameMap = new Map(
        distribuitori?.map(d => [d.nume_companie, d.nume_companie]) || []
      );

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

          // Get distributor name - try multiple approaches
          let distributorName = null;
          
          // First, try to match distribuitor_uuid with distribuitor ID
          if (comanda.distribuitor_uuid) {
            distributorName = distributoriByIdMap.get(comanda.distribuitor_uuid);
          }
          
          // If not found, try to match distribuitor_id with distribuitor ID (in case it's a UUID)
          if (!distributorName && comanda.distribuitor_id) {
            distributorName = distributoriByIdMap.get(comanda.distribuitor_id);
          }
          
          // If still not found, check if distribuitor_id is already a company name
          if (!distributorName && comanda.distribuitor_id) {
            distributorName = distributoriByNameMap.get(comanda.distribuitor_id);
          }
          
          // Final fallback - use distribuitor_id as is
          if (!distributorName) {
            distributorName = comanda.distribuitor_id;
          }

          return {
            ...comanda,
            stockAvailable,
            distribuitor_nume: distributorName
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
