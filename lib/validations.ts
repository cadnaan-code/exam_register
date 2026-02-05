import { z } from 'zod'

// Student validation
export const studentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  fullName: z.string().min(1, 'Full name is required'),
  department: z.string().min(1, 'Department is required'),
  classId: z.string().min(1, 'Class is required'),
  semester: z.string().min(1, 'Semester is required'),
  shift: z.enum(['fulltime', 'parttime']),
})

// Course validation (for specific courses)
export const courseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  examType: z.enum(['Midterm', 'Final']),
})

// Special exam registration validation
export const registrationSchema = z.object({
  registrationFormId: z.string().min(1, 'Registration form ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  examScope: z.enum(['all-midterm', 'all-final', 'specific']),
  courses: z.array(courseSchema).optional(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  documentUrl: z.string().url().optional().nullable(),
})

// Registration form validation
export const registrationFormSchema = z.object({
  name: z.string().min(1, 'Form name is required'),
  description: z.string().optional(),
  type: z.enum(['Special Exam', 'Administrative', 'Resit Exam', 'Improvement Exam']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// Admin user validation
export const adminUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  type: z.enum(['Admin', 'Dean', 'HOD', 'User']),
  status: z.enum(['Active', 'Inactive']),
})

// Approval action validation
export const approvalActionSchema = z.object({
  registrationId: z.string().min(1, 'Registration ID is required'),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
})
