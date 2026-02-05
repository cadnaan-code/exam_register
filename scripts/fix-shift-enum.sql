-- SQL script to fix Shift enum in PostgreSQL
-- Run this directly in your Neon database console or psql

-- Step 1: Update existing records (if any exist)
UPDATE "students" 
SET "shift" = 'FULLTIME'::text::"Shift"
WHERE "shift"::text = 'MORNING';

UPDATE "students" 
SET "shift" = 'PARTTIME'::text::"Shift"
WHERE "shift"::text IN ('AFTERNOON', 'EVENING');

-- Step 2: Drop and recreate the enum
-- WARNING: This will drop the enum and recreate it
-- Make sure you have a backup!

-- First, change the column to text temporarily
ALTER TABLE "students" 
ALTER COLUMN "shift" TYPE text;

-- Drop the old enum
DROP TYPE IF EXISTS "Shift" CASCADE;

-- Create new enum with correct values
CREATE TYPE "Shift" AS ENUM ('FULLTIME', 'PARTTIME');

-- Change column back to enum
ALTER TABLE "students" 
ALTER COLUMN "shift" TYPE "Shift" 
USING "shift"::"Shift";

-- Set default
ALTER TABLE "students" 
ALTER COLUMN "shift" SET DEFAULT 'FULLTIME'::"Shift";
