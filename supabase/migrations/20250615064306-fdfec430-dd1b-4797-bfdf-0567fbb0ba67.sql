
-- Adaugă coloane pentru detaliile anulării în tabela comenzi
ALTER TABLE public.comenzi 
ADD COLUMN data_anulare timestamp with time zone,
ADD COLUMN motiv_anulare text,
ADD COLUMN anulat_de uuid REFERENCES auth.users(id);

-- Adaugă comentarii pentru claritate
COMMENT ON COLUMN public.comenzi.data_anulare IS 'Data și ora când comanda a fost anulată';
COMMENT ON COLUMN public.comenzi.motiv_anulare IS 'Motivul anulării comenzii';
COMMENT ON COLUMN public.comenzi.anulat_de IS 'ID-ul utilizatorului care a anulat comanda';
