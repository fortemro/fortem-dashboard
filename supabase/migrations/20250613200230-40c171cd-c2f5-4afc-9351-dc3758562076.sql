
-- Modifică coloana status pentru a include noile valori
-- Păstrează valorile existente și adaugă cele noi
ALTER TABLE public.comenzi 
ALTER COLUMN status TYPE text;

-- Adaugă un comentariu pentru a documenta valorile acceptate
COMMENT ON COLUMN public.comenzi.status IS 'Statusuri acceptate: in_asteptare, procesare, in_procesare, pregatit_pentru_livrare, in_tranzit, livrata, finalizata, anulata';
