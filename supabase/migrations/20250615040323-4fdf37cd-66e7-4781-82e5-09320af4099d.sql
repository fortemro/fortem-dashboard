
-- Verificăm trigger-urile existente pe tabela comenzi
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'comenzi';

-- Verificăm și funcțiile care ar putea referi tabela distribuitori
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition ILIKE '%distribuitori%';
