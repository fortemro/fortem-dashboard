
-- Activează Row Level Security pe tabelul produse
ALTER TABLE public.produse ENABLE ROW LEVEL SECURITY;

-- Permite tuturor utilizatorilor autentificați să vadă produsele
CREATE POLICY "Allow select to all authenticated users"
  ON public.produse
  FOR SELECT
  TO authenticated
  USING (true);

-- Permite tuturor utilizatorilor autentificați să facă UPDATE la produse
CREATE POLICY "Allow update to all authenticated users"
  ON public.produse
  FOR UPDATE
  TO authenticated
  USING (true);

-- Permite tuturor utilizatorilor autentificați să adauge produse
CREATE POLICY "Allow insert to all authenticated users"
  ON public.produse
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permite tuturor utilizatorilor autentificați să steargă produse (opțional, poate vrei să elimini această regulă)
CREATE POLICY "Allow delete to all authenticated users"
  ON public.produse
  FOR DELETE
  TO authenticated
  USING (true);
