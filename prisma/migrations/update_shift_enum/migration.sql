-- Migration to update Shift enum from MORNING/AFTERNOON/EVENING to FULLTIME/PARTTIME

-- Step 1: Update existing records to use new enum values
-- First, we need to temporarily allow text values, then convert

-- Update MORNING to FULLTIME
UPDATE "students" 
SET "shift" = 'FULLTIME'::text::"Shift"
WHERE "shift"::text = 'MORNING';

-- Update AFTERNOON and EVENING to PARTTIME
UPDATE "students" 
SET "shift" = 'PARTTIME'::text::"Shift"
WHERE "shift"::text IN ('AFTERNOON', 'EVENING');

-- Step 2: Drop the old enum and recreate with new values
-- Note: This requires dropping dependent objects first

-- Create new enum type
DO $$ 
BEGIN
    -- Drop old enum if it exists (this will fail if there are dependencies)
    DROP TYPE IF EXISTS "Shift" CASCADE;
    
    -- Create new enum with correct values
    CREATE TYPE "Shift" AS ENUM ('FULLTIME', 'PARTTIME');
    
    -- Alter the students table to use the new enum
    ALTER TABLE "students" 
    ALTER COLUMN "shift" TYPE "Shift" 
    USING "shift"::text::"Shift";
    
    -- Set default value
    ALTER TABLE "students" 
    ALTER COLUMN "shift" SET DEFAULT 'FULLTIME'::"Shift";
END $$;
