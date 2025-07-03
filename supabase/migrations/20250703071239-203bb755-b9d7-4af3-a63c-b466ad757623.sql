
-- Repararea funcției get_stocuri_reale_pentru_produse()
-- Problema era că search_path era setat la string gol, ceea ce împiedica găsirea tabelelor
CREATE OR REPLACE FUNCTION public.get_stocuri_reale_pentru_produse()
RETURNS TABLE(produs_id UUID, stoc_real INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH stoc_alocat AS (
        SELECT 
            public.itemi_comanda.produs_id,
            COALESCE(SUM(public.itemi_comanda.cantitate), 0) as cantitate_alocata
        FROM public.itemi_comanda
        INNER JOIN public.comenzi ON public.itemi_comanda.comanda_id = public.comenzi.id
        WHERE public.comenzi.status IN ('in_asteptare', 'in_procesare', 'in_tranzit')
        GROUP BY public.itemi_comanda.produs_id
    )
    SELECT 
        p.id::UUID as produs_id,
        (COALESCE(p.stoc_disponibil, 0) - COALESCE(sa.cantitate_alocata, 0))::INTEGER as stoc_real
    FROM public.produse p
    LEFT JOIN stoc_alocat sa ON p.id = sa.produs_id
    ORDER BY p.nume;
END;
$$;
