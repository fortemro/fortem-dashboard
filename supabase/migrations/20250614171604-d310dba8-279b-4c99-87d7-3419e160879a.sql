
CREATE OR REPLACE FUNCTION public.get_stocuri_reale_pentru_produse()
RETURNS TABLE(produs_id UUID, stoc_real INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH stoc_alocat AS (
        SELECT 
            ic.produs_id,
            COALESCE(SUM(ic.cantitate), 0) as cantitate_alocata
        FROM itemi_comanda ic
        INNER JOIN comenzi c ON ic.comanda_id = c.id
        WHERE c.status IN ('in_asteptare', 'in_procesare', 'in_tranzit')
        GROUP BY ic.produs_id
    )
    SELECT 
        p.id::UUID as produs_id,
        (COALESCE(p.stoc_disponibil, 0) - COALESCE(sa.cantitate_alocata, 0))::INTEGER as stoc_real
    FROM produse p
    LEFT JOIN stoc_alocat sa ON p.id = sa.produs_id
    ORDER BY p.nume;
END;
$$;
