
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
      const { data, error } = await supabase
        .from('comenzi')
        .select(`
          *,
          distribuitor:distribuitori(*)
        `)
        .order('data_comanda', { ascending: false });

      if (error) throw error;
      return data as Comanda[];
    }
  });

  const updateComandaStatus = async (comandaId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('comenzi')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', comandaId);

      if (error) throw error;

      // Invalidate and refetch the query
      queryClient.invalidateQueries({ queryKey: ['comenzi-logistica'] });

      toast({
        title: "Status actualizat",
        description: `Statusul comenzii a fost schimbat în "${newStatus}"`
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
