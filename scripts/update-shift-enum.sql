-- SQL script to update Shift enum in PostgreSQL
-- Run this manually in your database if Prisma db push fails

-- First, update existing records
UPDATE students 
SET shift = 'FULLTIME' 
WHERE shift = 'MORNING';

UPDATE students 
SET shift = 'PARTTIME' 
WHERE shift IN ('AFTERNOON', 'EVENING');

-- Then alter the enum type (PostgreSQL specific)
-- Note: You may need to drop and recreate the enum if there are constraints
-- This is a complex operation and may require dropping foreign keys first

-- Alternative: Use Prisma migrate instead
-- Run: npx prisma migrate dev --name change_shift_enum
