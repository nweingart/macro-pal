ALTER TABLE user_profile
  ADD COLUMN streak_freeze_available boolean NOT NULL DEFAULT true,
  ADD COLUMN streak_freeze_used_on date DEFAULT NULL;
