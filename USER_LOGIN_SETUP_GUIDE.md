# User Login Setup Guide

## Overview
This guide explains how to enable login for all database users with their email and password credentials, ensuring proper role-based access control.

## Changes Made

### 1. Updated Password Hashing Endpoint
The `/api/auth/fix-passwords` endpoint has been updated to include all users from your database with their passwords:

**Users Added:**
- `test2@gmail.com` / `admin123` (manager)
- `pm@sprintsync.com` / `admin123` (manager)
- `qa@sprintsync.com` / `admin123` (manager)
- `asam@pms.com` / `@Dmin123` (developer)
- `dev1@sprintsync.com` / `admin123` (developer)
- `designer@sprintsync.com` / `admin123` (designer)
- `testuserh6@api.com` / `admin123` (designer)
- `dev2@sprintsync.com` / `admin123` (developer)
- `test@gmail.com` / `Test@123` (developer)
- `admin@demo.com` / `admin123` (admin)

### 2. Fixed Frontend User Data Mapping
Updated `AuthContextEnhanced.tsx` to properly map user data from API response, handling both `avatarUrl`/`avatar` and `departmentId`/`department` fields for compatibility.

### 3. Role-Based Access Control
The application already has role-based routing configured:
- **Admin**: Dashboard, Projects, Team Allocation, Reports, Admin Panel
- **Manager**: Dashboard, Projects, Scrum Management, Time Tracking, AI Insights, Team Allocation, Reports, Todo List
- **Developer**: Dashboard, Projects, Scrum Management, Time Tracking, AI Insights, Reports, Todo List
- **Designer**: Dashboard, Projects, Scrum Management, Time Tracking, AI Insights, Reports, Todo List

## Setup Instructions

### Step 1: Hash All User Passwords
First, you need to hash all user passwords in the database. Call the password fixing endpoint:

**Using curl:**
```bash
curl -X POST http://localhost:8080/api/auth/fix-passwords
```

**Using PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/auth/fix-passwords" -Method POST
```

**Using Postman or any HTTP client:**
- Method: POST
- URL: `http://localhost:8080/api/auth/fix-passwords`
- Headers: `Content-Type: application/json`

### Step 2: Verify Login
After hashing passwords, users can log in with their email and password:

**Example Logins:**
- Email: `test2@gmail.com`, Password: `admin123` → Manager portal
- Email: `pm@sprintsync.com`, Password: `admin123` → Manager portal
- Email: `admin@demo.com`, Password: `admin123` → Admin portal
- Email: `dev1@sprintsync.com`, Password: `admin123` → Developer portal
- Email: `designer@sprintsync.com`, Password: `admin123` → Designer portal

## How It Works

### Authentication Flow
1. User enters email and password on login page
2. Frontend sends credentials to `/api/auth/login`
3. Backend:
   - Finds user by email
   - Verifies password using BCrypt
   - Generates JWT token with user role and details
   - Returns token and user data
4. Frontend:
   - Stores token and user data
   - Redirects to dashboard
   - Applies role-based routing and menu filtering

### Role-Based Features
- **Managers** have access to:
  - Scrum Management (sprint planning and tracking)
  - Projects (view and manage)
  - Team Allocation (resource management)
  - Time Tracking, AI Insights, Reports
  
- **Developers** and **Designers** have access to:
  - Scrum Management
  - Projects
  - Time Tracking
  - AI Insights
  - Reports
  - Todo List

- **Admins** have full access including:
  - Admin Panel
  - User Management
  - All features available to managers

## Troubleshooting

### Issue: Login fails with "Invalid email or password"
**Solution:** Ensure passwords are hashed by calling the `/api/auth/fix-passwords` endpoint.

### Issue: User logged in but wrong role/permissions
**Solution:** Verify the user's role in the database matches the expected role (admin, manager, developer, designer).

### Issue: Can't access certain pages after login
**Solution:** Check that the user's role has permission to access that page (see Role-Based Access Control section above).

## API Endpoints

### Login
- **POST** `/api/auth/login`
- Body: `{ "email": "user@example.com", "password": "password123" }`
- Response: `{ "success": true, "data": { "token": "...", "user": {...} } }`

### Fix Passwords (Utility)
- **POST** `/api/auth/fix-passwords`
- Hashes all user passwords with BCrypt
- Returns: `{ "success": true, "updatedCount": 10, "updatedEmails": [...] }`

### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`
- Returns current authenticated user details

