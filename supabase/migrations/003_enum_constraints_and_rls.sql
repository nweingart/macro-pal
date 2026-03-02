-- 003_enum_constraints_and_rls.sql
-- Adds CHECK constraints on user_profile enum columns and splits broad RLS policies into per-operation policies

BEGIN;

-- ============================================================
-- 1. CHECK constraints on user_profile enum columns (allow NULL)
-- ============================================================

ALTER TABLE user_profile
  ADD CONSTRAINT chk_gender
    CHECK (gender IN ('male', 'female', 'other')),
  ADD CONSTRAINT chk_activity_level
    CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  ADD CONSTRAINT chk_diet_plan
    CHECK (diet_plan IN ('maintain', 'lose', 'gain'));

-- ============================================================
-- 2. Split broad "for all" RLS policies into per-operation policies
-- ============================================================

-- user_profile
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profile;

CREATE POLICY "user_profile_select" ON user_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_profile_insert" ON user_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profile_update" ON user_profile
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profile_delete" ON user_profile
  FOR DELETE USING (auth.uid() = user_id);

-- food_library
DROP POLICY IF EXISTS "Users can manage own foods" ON food_library;

CREATE POLICY "food_library_select" ON food_library
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "food_library_insert" ON food_library
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "food_library_update" ON food_library
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "food_library_delete" ON food_library
  FOR DELETE USING (auth.uid() = user_id);

-- meal_log
DROP POLICY IF EXISTS "Users can manage own logs" ON meal_log;

CREATE POLICY "meal_log_select" ON meal_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meal_log_insert" ON meal_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_log_update" ON meal_log
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_log_delete" ON meal_log
  FOR DELETE USING (auth.uid() = user_id);

COMMIT;
