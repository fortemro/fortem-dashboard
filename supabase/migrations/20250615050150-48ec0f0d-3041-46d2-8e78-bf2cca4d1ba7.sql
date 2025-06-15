
-- Dezactivăm trigger-ul problematic care cauzează eroarea cu schema "net"
DROP TRIGGER IF EXISTS trigger_notify_order_shipped ON public.comenzi;

-- Eliminăm și funcția asociată pentru curățenie
DROP FUNCTION IF EXISTS public.notify_order_shipped();
