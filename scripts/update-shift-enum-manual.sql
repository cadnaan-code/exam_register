-- Manual SQL script to update Shift enum in PostgreSQL
-- Run this in your database (Neon console or psql)

-- Step 1: Update existing records (if any)
UPDATE students 
SET shift = 'FULLTIME' 
WHERE shift = 'MORNING';

UPDATE students 
SET shift = 'PARTTIME' 
WHERE shift IN ('AFTERNOON', 'EVENING');

-- Step 2: Drop the old enum type (if it exists with old values)
-- Note: This will fail if there are foreign key constraints
-- You may need to drop and recreate the enum

-- Step 3: Recreate the enum with new values
-- First, check what enum values exist:
-- SELECT unnest(enum_range(NULL::"Shift")) AS enum_value;

-- If the enum needs to be recreated, you'll need to:
-- 1. ALTER TYPE "Shift" ADD VALUE 'FULLTIME' (if not exists)
-- 2. ALTER TYPE "Shift" ADD VALUE 'PARTTIME' (if not exists)
-- 3. Remove old values (this is complex in PostgreSQL)

-- RECOMMENDED: Use Prisma instead:
-- npx prisma db push
-- This will handle the enum migration automatically
