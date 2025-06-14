
-- Actualizăm constraint-ul pentru a permite toate statusurile folosite în aplicație
ALTER TABLE public.comenzi DROP CONSTRAINT IF EXISTS comenzi_status_check;

-- Adăugăm un nou constraint care include toate statusurile necesare
ALTER TABLE public.comenzi ADD CONSTRAINT comenzi_status_check 
CHECK (status IN ('in_asteptare', 'in_procesare', 'in_tranzit', 'livrata', 'anulata'));

-- Actualizăm comentariul pentru a reflecta valorile acceptate
COMMENT ON COLUMN public.comenzi.status IS 'Statusuri acceptate: in_asteptare, in_procesare, in_tranzit, livrata, anulata';
