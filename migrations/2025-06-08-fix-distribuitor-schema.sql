-- Migration to change distribuitor_id in comenzi to UUID and add foreign key constraint

BEGIN;

-- 1. Add new UUID column for distribuitor_id_new
ALTER TABLE comenzi ADD COLUMN distribuitor_id_new UUID;

-- 2. Update distribuitor_id_new by joining with distribuitori table on old distribuitor_id text
-- Assuming old distribuitor_id is text and matches distribuitori.id as UUID string
UPDATE comenzi c
SET distribuitor_id_new = d.id
FROM distribuitori d
WHERE c.distribuitor_id = d.id::text;

-- 3. Set distribuitor_id_new NOT NULL if possible (after data cleanup)
ALTER TABLE comenzi ALTER COLUMN distribuitor_id_new SET NOT NULL;

-- 4. Drop old distribuitor_id column
ALTER TABLE comenzi DROP COLUMN distribuitor_id;

-- 5. Rename distribuitor_id_new to distribuitor_id
ALTER TABLE comenzi RENAME COLUMN distribuitor_id_new TO distribuitor_id;

-- 6. Add foreign key constraint
ALTER TABLE comenzi
ADD CONSTRAINT fk_comenzi_distribuitor
FOREIGN KEY (distribuitor_id) REFERENCES distribuitori(id)
ON DELETE RESTRICT;

-- 7. Clean up incomplete or duplicate distributors (example)
DELETE FROM distribuitori
WHERE nume_companie IS NULL OR nume_companie = ''
OR id NOT IN (SELECT DISTINCT distribuitor_id FROM comenzi);

COMMIT;