# FECT Exam Management System - Backend Documentation

## Overview
Backend implementation for the FECT Exam Management System using Next.js App Router, Prisma, and PostgreSQL (Neon).

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **File Storage**: Supabase Storage
- **Language**: TypeScript

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

#### Initialize Prisma
```bash
npx prisma generate
```

#### Push Schema to Database
```bash
npx prisma db push
```

Or create a migration:
```bash
npx prisma migrate dev --name init
```

### 4. Supabase Storage Setup

1. Create a Supabase project at https://supabase.com
2. Create a storage bucket named `exam-documents`
3. Set bucket to public or configure policies as needed
4. Copy your project URL and keys to `.env`

### 5. Run Development Server
```bash
npm run dev
```

## Database Models

### Student
- `studentId` (unique): Student identifier (e.g., SIU-2023-0000)
- `fullName`: Student's full name
- `faculty`: Faculty/class (medicine, engineering, etc.)
- `semester`: Current semester
- `shift`: Morning, Afternoon, or Evening

### RegistrationForm
- `formName`: Name of the registration form
- `description`: Optional description
- `formType`: Special Exam, Administrative, Resit Exam, or Improvement Exam
- `isOpen`: Boolean indicating if registration is open
- `startDate` / `endDate`: Optional date range

### SpecialExamRegistration
- `registrationFormId`: Link to RegistrationForm
- `studentId`: Reference to student
- `examScope`: ALL_MIDTERM, ALL_FINAL, or SPECIFIC
- `courseName`: Required when examScope is SPECIFIC
- `examType`: MIDTERM or FINAL (nullable for ALL_MIDTERM/ALL_FINAL)
- `reason`: Student's reason for special exam
- `documentUrl`: Supabase Storage URL for supporting documents
- `approvalStatus`: PENDING, APPROVED, or REJECTED
- `rejectionReason`: Optional reason for rejection

### AdminUser
- `username` (unique): Login username
- `password`: Hashed password
- `fullName`: Full name
- `email`: Email address
- `userType`: ADMIN, DEAN, HOD, or USER
- `status`: ACTIVE or INACTIVE

## API Routes

### Students
- `GET /api/students` - Get all students or search
- `GET /api/students?studentId=xxx` - Get specific student
- `POST /api/students` - Create or update student

### Registration Forms
- `GET /api/registration-forms` - Get all forms
- `GET /api/registration-forms?id=xxx` - Get specific form
- `GET /api/registration-forms/[formId]/status` - Check if form is open
- `POST /api/registration-forms` - Create new form
- `PATCH /api/registration-forms` - Update form (toggle open/close, edit)
- `DELETE /api/registration-forms?id=xxx` - Delete form

### Registrations
- `GET /api/registrations` - Get all registrations (admin view)
- `POST /api/registrations` - Create new registration
- `POST /api/registrations/[id]/approve` - Approve registration
- `POST /api/registrations/[id]/reject` - Reject registration

### File Upload
- `POST /api/upload` - Upload file to Supabase Storage

### Admin Users
- `GET /api/admin-users` - Get all admin users
- `POST /api/admin-users` - Create new admin user
- `PATCH /api/admin-users` - Update admin user
- `DELETE /api/admin-users?id=xxx` - Delete admin user

## Important Notes

1. **UI Compatibility**: All API responses match the existing UI structure exactly
2. **Validation**: Input validation using Zod schemas
3. **File Upload**: Files are uploaded to Supabase Storage with 10MB limit
4. **Password Hashing**: Admin passwords are hashed using bcryptjs
5. **Registration Control**: Students can only register when `isOpen = true`
6. **Multiple Courses**: When examScope is "specific", one registration is created per course

## Next Steps

1. Update UI components to call these APIs instead of using mock data
2. Add authentication middleware for admin routes
3. Add rate limiting for public registration endpoints
4. Set up email notifications for approval/rejection
5. Add export functionality for Excel/PDF (JSON output ready)
