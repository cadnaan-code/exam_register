# SIU Special Exam Registration System

A modern web application for managing special exam registrations at Somali International University.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Project Structure

```
├── app/
│   ├── admin/
│   │   ├── login/          # Admin login page
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── registration-forms/  # Manage registration forms
│   │   ├── student-requests/    # Student requests management
│   │   └── reports/         # Reports and analytics
│   ├── register/
│   │   ├── closed/         # Registration closed page
│   │   └── [formId]/       # Student registration form
│   └── layout.tsx          # Root layout
├── components/
│   └── admin/              # Admin shared components
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── AdminLayout.tsx
└── ...
```

## Features

### Admin Portal
- **Login Page:** Secure admin authentication UI
- **Dashboard:** Overview with statistics and recent registrations
- **Registration Forms:** Create and manage registration forms
- **Student Requests:** Review and approve/reject student applications
- **Reports:** View analytics and export data

### Student Portal
- **Registration Form:** Multi-step form for exam registration
- **Success Page:** Confirmation after successful registration
- **Closed Page:** Message when registration is closed

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Important Notes

⚠️ **This is a UI-only implementation.** No backend logic, database, or authentication is implemented. All data is mock data for demonstration purposes.

The following features are UI-only:
- Form submissions
- Authentication
- File uploads
- Approval/rejection actions
- Export functionality
- Search and filters

Backend integration will be added in a later phase.

## UI Design

The UI follows the Somali International University branding with:
- Primary color: Green (#16a34a)
- Secondary color: Orange (#ea580c)
- Clean, modern, academic design
- Fully responsive layout

## License

© 2024 Somali International University. All rights reserved.
