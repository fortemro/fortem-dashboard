
import { supabase } from '@/integrations/supabase/client';

export async function updateComandaStatusDirect(
  comandaId: string, 
  newStatus: string, 
  setExpeditionDate: boolean = false, 
  setDeliveryDate: boolean = false
) {
  const updateData: any = { 
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  if (setExpeditionDate && newStatus === 'in_tranzit') {
    updateData.data_expediere = new Date().toISOString();
  }

  if (setDeliveryDate && newStatus === 'livrata') {
    updateData.data_livrare = new Date().toISOString();
  }

  // Use a very simple update query with no joins
  const { error } = await supabase
    .from('comenzi')
    .update(updateData)
    .eq('id', comandaId);

  if (error) {
    throw error;
  }

  return true;
}
