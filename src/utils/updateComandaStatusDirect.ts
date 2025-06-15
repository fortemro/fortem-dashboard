
import { supabase } from '@/integrations/supabase/client';

export async function updateComandaStatusDirect(
  comandaId: string, 
  newStatus: string, 
  setExpeditionDate: boolean = false, 
  setDeliveryDate: boolean = false
) {
  console.log('updateComandaStatusDirect called with:', {
    comandaId,
    newStatus,
    setExpeditionDate,
    setDeliveryDate
  });

  const updateData: any = { 
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  if (setExpeditionDate && newStatus === 'in_tranzit') {
    updateData.data_expediere = new Date().toISOString();
    console.log('Adding expedition date to update');
  }

  if (setDeliveryDate && newStatus === 'livrata') {
    updateData.data_livrare = new Date().toISOString();
    console.log('Adding delivery date to update');
  }

  console.log('Final update data:', updateData);

  try {
    // First, let's check if the order exists
    console.log('Checking if order exists...');
    const { data: existingOrder, error: checkError } = await supabase
      .from('comenzi')
      .select('id, status, numar_comanda')
      .eq('id', comandaId)
      .single();

    if (checkError) {
      console.error('Error checking existing order:', checkError);
      throw checkError;
    }

    console.log('Existing order found:', existingOrder);

    // Now perform the update with minimal fields
    console.log('Performing update...');
    const { data, error } = await supabase
      .from('comenzi')
      .update(updateData)
      .eq('id', comandaId)
      .select('id, status');

    if (error) {
      console.error('Update error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('Update successful:', data);
    return true;
  } catch (error) {
    console.error('Exception in updateComandaStatusDirect:', error);
    throw error;
  }
}
