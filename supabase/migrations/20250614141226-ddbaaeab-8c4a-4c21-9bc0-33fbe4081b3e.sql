
-- Adăugăm coloana prag_alerta_stoc în tabelul produse
ALTER TABLE public.produse 
ADD COLUMN prag_alerta_stoc integer DEFAULT 10;

-- Actualizăm toate înregistrările existente cu valoarea implicită 10
UPDATE public.produse 
SET prag_alerta_stoc = 10 
WHERE prag_alerta_stoc IS NULL;
