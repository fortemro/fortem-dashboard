
-- Eliminăm trigger-ul problematic
DROP TRIGGER IF EXISTS trigger_notify_order_shipped ON public.comenzi;

-- Eliminăm și funcția asociată
DROP FUNCTION IF EXISTS public.notify_order_shipped();

-- Recreăm funcția fără să acceseze tabela distribuitori inexistentă
CREATE OR REPLACE FUNCTION notify_order_shipped()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    -- Verificăm dacă statusul s-a schimbat în 'in_tranzit' și dacă avem email-ul agentului
    IF NEW.status = 'in_tranzit' AND OLD.status != 'in_tranzit' AND NEW.email_agent_vanzari IS NOT NULL THEN
        -- Folosim distribuitor_id direct ca nume, fără să accesăm tabela distribuitori
        -- Apelăm funcția edge pentru trimiterea email-ului
        PERFORM
            net.http_post(
                url := 'https://wucpnzelkaxxduqmtmiw.supabase.co/functions/v1/send-order-shipped-notification',
                headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y3BuemVsa2F4eGR1cW10bWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzczMDAsImV4cCI6MjA2NDgxMzMwMH0.3-1Wx-2TAeOhwg866LuLLFBNYMu0UORCDjaIMS57v8c"}'::jsonb,
                body := json_build_object(
                    'numar_comanda', NEW.numar_comanda,
                    'email_agent', NEW.email_agent_vanzari,
                    'nume_distribuitor', NEW.distribuitor_id,
                    'nume_transportator', COALESCE(NEW.nume_transportator, 'Nu a fost specificat'),
                    'numar_masina', COALESCE(NEW.numar_masina, 'Nu a fost specificat'),
                    'telefon_sofer', COALESCE(NEW.telefon_sofer, 'Nu a fost specificat')
                )::jsonb
            );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Recreăm trigger-ul
CREATE TRIGGER trigger_notify_order_shipped
    AFTER UPDATE ON public.comenzi
    FOR EACH ROW
    EXECUTE FUNCTION notify_order_shipped();
