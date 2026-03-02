-- 002_cascades_constraints_and_rpc.sql
-- Adds cascade deletes, unique food index, CHECK constraints, and atomic delete RPC

BEGIN;

-- ============================================================
-- 1. Re-add foreign keys with ON DELETE CASCADE
-- ============================================================

-- meal_log.food_library_id → food_library(id)
ALTER TABLE meal_log
  DROP CONSTRAINT IF EXISTS meal_log_food_library_id_fkey,
  ADD CONSTRAINT meal_log_food_library_id_fkey
    FOREIGN KEY (food_library_id) REFERENCES food_library(id) ON DELETE CASCADE;

-- meal_log.user_id → auth.users(id)
ALTER TABLE meal_log
  DROP CONSTRAINT IF EXISTS meal_log_user_id_fkey,
  ADD CONSTRAINT meal_log_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- food_library.user_id → auth.users(id)
ALTER TABLE food_library
  DROP CONSTRAINT IF EXISTS food_library_user_id_fkey,
  ADD CONSTRAINT food_library_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- user_profile.user_id → auth.users(id)
ALTER TABLE user_profile
  DROP CONSTRAINT IF EXISTS user_profile_user_id_fkey,
  ADD CONSTRAINT user_profile_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- 2. Unique index on food_library(user_id, lower(name))
--    First deduplicate any existing rows
-- ============================================================

-- Keep the row with the highest times_used (or latest created_at on tie)
-- and re-point meal_log references to the survivor before deleting dupes
DO $$
DECLARE
  survivor RECORD;
  dupe RECORD;
BEGIN
  FOR survivor IN
    SELECT DISTINCT ON (user_id, lower(name)) id, user_id, lower(name) AS lname
    FROM food_library
    ORDER BY user_id, lower(name), times_used DESC, created_at DESC
  LOOP
    FOR dupe IN
      SELECT id FROM food_library
      WHERE user_id = survivor.user_id
        AND lower(name) = survivor.lname
        AND id != survivor.id
    LOOP
      UPDATE meal_log SET food_library_id = survivor.id
        WHERE food_library_id = dupe.id;
      DELETE FROM food_library WHERE id = dupe.id;
    END LOOP;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_food_library_user_name_unique
  ON food_library (user_id, lower(name));

-- ============================================================
-- 3. CHECK constraints
-- ============================================================

-- Non-negative macros/calories on food_library
ALTER TABLE food_library
  ADD CONSTRAINT chk_food_calories CHECK (calories_per_serving >= 0),
  ADD CONSTRAINT chk_food_protein  CHECK (protein_per_serving >= 0),
  ADD CONSTRAINT chk_food_carbs    CHECK (carbs_per_serving >= 0),
  ADD CONSTRAINT chk_food_fat      CHECK (fat_per_serving >= 0);

-- Positive servings on meal_log
ALTER TABLE meal_log
  ADD CONSTRAINT chk_log_servings CHECK (servings > 0);

-- ============================================================
-- 4. Atomic delete_user_account RPC
-- ============================================================

CREATE OR REPLACE FUNCTION delete_user_account(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is the target user
  IF auth.uid() IS DISTINCT FROM target_user_id THEN
    RAISE EXCEPTION 'Not authorized to delete this account';
  END IF;

  -- Delete in dependency order (cascades handle most, but be explicit)
  DELETE FROM meal_log WHERE user_id = target_user_id;
  DELETE FROM food_library WHERE user_id = target_user_id;
  DELETE FROM user_profile WHERE user_id = target_user_id;

  -- Delete the auth user
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

COMMIT;
