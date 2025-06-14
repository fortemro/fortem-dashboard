
-- Adăugăm coloana pentru email-ul agentului de vânzări
ALTER TABLE public.comenzi 
ADD COLUMN email_agent_vanzari text;

-- Creăm funcția care va apela edge function-ul pentru trimiterea email-ului
CREATE OR REPLACE FUNCTION notify_order_shipped()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    distribuitor_nume text;
BEGIN
    -- Verificăm dacă statusul s-a schimbat în 'in_tranzit' și dacă avem email-ul agentului
    IF NEW.status = 'in_tranzit' AND OLD.status != 'in_tranzit' AND NEW.email_agent_vanzari IS NOT NULL THEN
        -- Obținem numele distribuitorului
        SELECT nume_companie INTO distribuitor_nume
        FROM distribuitori 
        WHERE id::text = NEW.distribuitor_id
        LIMIT 1;
        
        -- Dacă nu găsim distribuitor prin UUID, folosim distribuitor_id ca nume
        IF distribuitor_nume IS NULL THEN
            distribuitor_nume := NEW.distribuitor_id;
        END IF;
        
        -- Apelăm funcția edge pentru trimiterea email-ului
        PERFORM
            net.http_post(
                url := 'https://wucpnzelkaxxduqmtmiw.supabase.co/functions/v1/send-order-shipped-notification',
                headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y3BuemVsa2F4eGR1cW10bWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzczMDAsImV4cCI6MjA2NDgxMzMwMH0.3-1Wx-2TAeOhwg866LuLLFBNYMu0UORCDjaIMS57v8c"}'::jsonb,
                body := json_build_object(
                    'numar_comanda', NEW.numar_comanda,
                    'email_agent', NEW.email_agent_vanzari,
                    'nume_distribuitor', distribuitor_nume,
                    'nume_transportator', COALESCE(NEW.nume_transportator, 'Nu a fost specificat'),
                    'numar_masina', COALESCE(NEW.numar_masina, 'Nu a fost specificat'),
                    'telefon_sofer', COALESCE(NEW.telefon_sofer, 'Nu a fost specificat')
                )::jsonb
            );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Creăm trigger-ul pentru apelarea funcției
CREATE TRIGGER trigger_notify_order_shipped
    AFTER UPDATE ON public.comenzi
    FOR EACH ROW
    EXECUTE FUNCTION notify_order_shipped();
