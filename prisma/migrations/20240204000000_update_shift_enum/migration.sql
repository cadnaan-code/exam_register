-- AlterEnum
-- This migration updates the Shift enum from FULLTIME/PARTTIME to FULL_TIME/PART_TIME

-- Step 1: Convert column to text temporarily
ALTER TABLE "students" ALTER COLUMN "shift" TYPE text;

-- Step 2: Drop old enum
DROP TYPE IF EXISTS "Shift";

-- Step 3: Create new enum with correct values
CREATE TYPE "Shift" AS ENUM ('FULL_TIME', 'PART_TIME');

-- Step 4: Convert column back to enum
ALTER TABLE "students" ALTER COLUMN "shift" TYPE "Shift" USING "shift"::"Shift";

-- Step 5: Set default value
ALTER TABLE "students" ALTER COLUMN "shift" SET DEFAULT 'FULL_TIME'::"Shift";
