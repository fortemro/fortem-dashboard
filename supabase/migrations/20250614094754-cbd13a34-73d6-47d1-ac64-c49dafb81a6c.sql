
-- Redenumește coloana awb în numar_masina
ALTER TABLE public.comenzi 
RENAME COLUMN awb TO numar_masina;

-- Adaugă coloana nume_sofer (opțională)
ALTER TABLE public.comenzi 
ADD COLUMN nume_sofer text;

-- Adaugă coloana telefon_sofer (opțională)
ALTER TABLE public.comenzi 
ADD COLUMN telefon_sofer text;
