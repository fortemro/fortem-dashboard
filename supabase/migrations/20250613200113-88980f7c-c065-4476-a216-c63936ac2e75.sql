
-- Adaugă coloana awb (număr AWB pentru transport)
ALTER TABLE public.comenzi 
ADD COLUMN awb text;

-- Adaugă coloana nume_transportator (numele companiei de transport)
ALTER TABLE public.comenzi 
ADD COLUMN nume_transportator text;

-- Adaugă coloana data_expediere (data și timpul expedierii)
ALTER TABLE public.comenzi 
ADD COLUMN data_expediere timestamp with time zone;
