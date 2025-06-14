
-- Adaugă coloana data_livrare (opțională) - data_expediere există deja
ALTER TABLE public.comenzi 
ADD COLUMN IF NOT EXISTS data_livrare timestamp with time zone;

-- Verifică și adaugă coloanele de text dacă nu există (cele mai multe există deja)
ALTER TABLE public.comenzi 
ADD COLUMN IF NOT EXISTS nume_transportator text;

ALTER TABLE public.comenzi 
ADD COLUMN IF NOT EXISTS numar_masina text;

ALTER TABLE public.comenzi 
ADD COLUMN IF NOT EXISTS nume_sofer text;

ALTER TABLE public.comenzi 
ADD COLUMN IF NOT EXISTS telefon_sofer text;

-- Verifică și adaugă data_expediere dacă nu există (ar trebui să existe deja)
ALTER TABLE public.comenzi 
ADD COLUMN IF NOT EXISTS data_expediere timestamp with time zone;
