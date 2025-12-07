# Architecture Clarification: Admin Panel vs Mobile App

## Overview

This document clarifies the separation of concerns between the **Admin Panel** (evsu-emap-admin) and the **Mobile App** (EVSUeMAP).

## ✅ Current Implementation (Correct)

### Admin Panel Features

These features belong in the Admin Panel because they are **management/admin functions**:

1. **Audit Trail** ✅
   - **Purpose**: Track all system actions for security and compliance
   - **Who uses it**: Administrators only
   - **Location**: Admin Panel
   - **Why**: Admins need to monitor user activities, troubleshoot issues, and ensure security

2. **Feedback Management** ✅
   - **Purpose**: View, manage, and respond to user feedback
   - **Who uses it**: Administrators
   - **Location**: Admin Panel
   - **Why**: Admins need to review feedback, update status, set priorities, and add notes

3. **Building Management** ✅
   - **Purpose**: Create, edit, delete buildings and their rectangular footprints
   - **Who uses it**: Administrators
   - **Location**: Admin Panel

4. **Room Management** ✅
   - **Purpose**: Manage rooms within buildings
   - **Who uses it**: Administrators
   - **Location**: Admin Panel

5. **Path Management** ✅
   - **Purpose**: Create and manage pathways between buildings
   - **Who uses it**: Administrators
   - **Location**: Admin Panel

6. **User Management** ✅
   - **Purpose**: Manage admin panel users
   - **Who uses it**: Administrators
   - **Location**: Admin Panel

## 📱 Mobile App Features (Future Implementation)

These features should be in the Mobile App:

1. **Feedback Submission** ⏳
   - **Purpose**: Allow end-users to submit feedback
   - **Who uses it**: Students, faculty, visitors
   - **Location**: Mobile App (EVSUeMAP)
   - **Implementation**: Create a feedback form in the mobile app that posts to the same `user_feedback` table

2. **Map Viewing** ⏳
   - **Purpose**: View buildings as rectangles on the map
   - **Who uses it**: End-users
   - **Location**: Mobile App

3. **Navigation** ⏳
   - **Purpose**: Navigate between buildings
   - **Who uses it**: End-users
   - **Location**: Mobile App

## 🔄 Data Flow

```
┌─────────────────┐
│   Mobile App    │
│   (End Users)   │
└────────┬────────┘
         │
         │ Submits feedback
         ▼
┌─────────────────┐
│   Supabase DB   │
│ user_feedback   │
└────────┬────────┘
         │
         │ Admins view/manage
         ▼
┌─────────────────┐
│  Admin Panel    │
│ (Administrators)│
└─────────────────┘
```

## 📋 Summary

| Feature | Admin Panel | Mobile App | Reason |
|---------|------------|------------|--------|
| **View Audit Trail** | ✅ Yes | ❌ No | Admin-only security feature |
| **Manage Feedback** | ✅ Yes | ❌ No | Admin management function |
| **Submit Feedback** | ⏳ Optional | ✅ Yes | End-user action |
| **View Buildings** | ✅ Yes (for editing) | ✅ Yes (for viewing) | Different use cases |
| **Manage Buildings** | ✅ Yes | ❌ No | Admin function |

## ✅ Current Status: CORRECT

The current implementation is **correct**. Audit Trail and Feedback Management are properly placed in the Admin Panel because:

1. **Audit Trail**: Only administrators need to see system logs
2. **Feedback Management**: Only administrators need to review, categorize, and respond to feedback

## 🚀 Next Steps

When implementing the Mobile App, add:
- Feedback submission form that posts to `user_feedback` table
- Map view showing buildings as rectangles
- Navigation features

The Admin Panel will automatically see new feedback submissions from mobile users in the Feedback Management page.

---

**Conclusion**: The current architecture is correct. Audit Trail and Feedback Management belong in the Admin Panel. The Mobile App will submit feedback, and admins will manage it.
