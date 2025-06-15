
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
    // First, check if the order exists and get current data for email
    console.log('Checking if order exists and fetching data...');
    const { data: existingOrder, error: checkError } = await supabase
      .from('comenzi')
      .select('id, numar_comanda, email_agent_vanzari, distribuitor_id, distribuitor_uuid, nume_transportator, numar_masina, telefon_sofer')
      .eq('id', comandaId)
      .single();

    if (checkError) {
      console.error('Error checking existing order:', checkError);
      throw checkError;
    }

    if (!existingOrder) {
      console.error('Order not found with ID:', comandaId);
      throw new Error('Order not found');
    }

    console.log('Existing order found:', existingOrder);

    // Perform the update
    console.log('Performing update...');
    const { error: updateError } = await supabase
      .from('comenzi')
      .update(updateData)
      .eq('id', comandaId);

    if (updateError) {
      console.error('Update error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      throw updateError;
    }

    console.log('Update successful');

    // If status changed to 'in_tranzit' and we have email, send notification
    if (newStatus === 'in_tranzit' && existingOrder.email_agent_vanzari) {
      console.log('Sending order shipped notification...');
      
      try {
        const { error: emailError } = await supabase.functions.invoke('send-order-shipped-notification', {
          body: {
            numar_comanda: existingOrder.numar_comanda,
            email_agent: existingOrder.email_agent_vanzari,
            nume_distribuitor: existingOrder.distribuitor_id,
            nume_transportator: existingOrder.nume_transportator || 'Nu a fost specificat',
            numar_masina: existingOrder.numar_masina || 'Nu a fost specificat',
            telefon_sofer: existingOrder.telefon_sofer || 'Nu a fost specificat'
          }
        });

        if (emailError) {
          console.error('Error sending email notification:', emailError);
          // Don't throw here - we don't want to fail the status update if email fails
        } else {
          console.log('Email notification sent successfully');
        }
      } catch (emailException) {
        console.error('Exception while sending email:', emailException);
        // Don't throw here - we don't want to fail the status update if email fails
      }
    }

    return true;
  } catch (error) {
    console.error('Exception in updateComandaStatusDirect:', error);
    throw error;
  }
}
