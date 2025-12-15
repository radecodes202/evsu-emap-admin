# EVSU eMAP Admin Panel

Admin panel for managing the EVSU eMAP campus navigation and mapping system. Built with React, Vite, Material-UI, and Supabase.

## 🎯 Project Overview

The EVSU eMAP Admin Panel is a comprehensive web application for managing campus data including buildings, rooms, pathways, users, and system settings. It integrates directly with Supabase (PostgreSQL + PostGIS) for data storage.

**This is the Admin Panel** - the mobile app is a separate project that consumes the same Supabase database.

## ✨ Features

### Core Features

- 🏢 **Building Management** - Create, edit, delete buildings with rectangular footprints
- 🚪 **Rooms & Locations** - Manage rooms within buildings (floors, types, capacity)
- 🛤️ **Paths & Walkways** - Create pathways with waypoints for navigation
- 👥 **User Management** - Manage admin panel users and view mobile app users
- 📊 **Dashboard** - Overview with statistics and quick actions
- 🗺️ **Interactive Maps** - Leaflet maps for visual editing
- 🔒 **Audit Trail** - Track all system actions
- 💬 **User Feedback** - Manage feedback from mobile app users
- ⚙️ **Campus Config** - Configure campus center and boundaries

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Material-UI |
| State | React Query, React Hook Form |
| Maps | Leaflet / React-Leaflet |
| Database | Supabase (PostgreSQL + PostGIS) |
| Auth | Supabase Auth + Local admin auth |

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire `supabase-fresh-setup.sql` script
3. Get your keys from **Settings → API**

### 3. Configure Environment

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_SERVICE_KEY=your-service-role-key
VITE_ADMIN_EMAIL=admin@email.com
VITE_ADMIN_PASSWORD=********
```

> ⚠️ Use the **service_role** key (not anon key) for the admin panel

### 4. Start Development Server

```bash
npm run dev
```

Open `http://localhost:5173`

## 📁 Project Structure

```
evsu-emap-admin/
├── src/
│   ├── components/           # Reusable components
│   │   ├── Layout/          # Dashboard layout
│   │   └── ProtectedRoute.jsx
│   ├── config/
│   │   └── api.js           # Campus boundaries config
│   ├── context/
│   │   └── AuthContext.jsx  # Auth state
│   ├── hooks/               # React Query hooks
│   │   ├── useBuildings.js
│   │   ├── useLocations.js
│   │   ├── usePaths.js
│   │   └── useUsers.js
│   ├── lib/
│   │   └── supabase.js      # Supabase client
│   ├── pages/               # Page components
│   │   ├── BuildingsPage.jsx
│   │   ├── BuildingFormPage.jsx
│   │   ├── RoomsPage.jsx
│   │   ├── PathsPage.jsx
│   │   ├── PathFormPage.jsx
│   │   ├── UsersPage.jsx
│   │   ├── AuditTrailPage.jsx
│   │   ├── FeedbackPage.jsx
│   │   ├── CampusConfigPage.jsx
│   │   └── ...
│   ├── services/            # Supabase service layer
│   │   ├── buildingService.js
│   │   ├── locationService.js
│   │   ├── pathService.js
│   │   ├── userService.js
│   │   ├── auditService.js
│   │   └── feedbackService.js
│   ├── utils/
│   │   └── campusConfig.js  # Campus config utility
│   ├── App.jsx
│   └── main.jsx
├── docs/                     # Documentation
├── supabase-fresh-setup.sql  # Database setup script
└── README.md
```

## 🗄️ Database Schema

Run `supabase-fresh-setup.sql` in Supabase SQL Editor to create all tables.

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Mobile app users (auto-created on signup via Supabase Auth) |
| `buildings` | Campus buildings with dimensions (width, height, rotation) |
| `locations` | Rooms within buildings |
| `paths` | Admin-defined walkways for navigation |
| `waypoints` | Points along paths |
| `path_connections` | Connections between different paths |
| `favorites` | User saved buildings |
| `admin_users` | Admin panel users |
| `audit_logs` | Action tracking |
| `user_feedback` | Mobile app user feedback |

### Key Features

- **PostGIS** enabled for geospatial queries
- **Row Level Security (RLS)** for data protection
- **Triggers** for auto-updating timestamps and geography points
- **Indexes** for query optimization

## 👥 User Types

| User Type | Table | How Created | Used For |
|-----------|-------|-------------|----------|
| **Admin Panel Users** | `admin_users` | Created in admin panel | Managing campus data |
| **Mobile App Users** | `users` | Sign up in mobile app | Using the navigation app |

### Mobile App Signup

Mobile app users sign up with **email + password only** (no username required):

```javascript
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})
```

A profile is automatically created in the `users` table via a database trigger.

## 🔐 Authentication

### Admin Panel Login

- Uses local authentication with `.env` credentials
- Session stored in localStorage
- All routes protected by `ProtectedRoute`

### Default Login

- **Email**: `admin@evsu.edu.ph`
- **Password**: `admin123`

## 🎨 Features Guide

### Building Management

- Set building name, code, description
- Define dimensions (width, height in meters)
- Set rotation angle for oriented rectangles
- Place on map with click or manual coordinates
- Categorize: Academic, Administrative, Facility, Sports, Residential, Other

### Paths & Walkways

- Create paths with names and types
- Add waypoints by clicking on map
- Drag waypoints to adjust positions
- Path types: Walkway, Road, Stairs, Indoor, Corridor, Elevator, etc.

### User Management

- Create admin users with name, email, role
- View mobile app users (read-only)
- Edit roles and status
- Delete users

### Campus Configuration

- Set campus center coordinates
- Configure map boundaries
- Settings saved to localStorage and used across pages

## 🔧 Configuration

### Campus Boundaries

Edit `src/config/api.js`:

```javascript
export const EVSU_CENTER = {
  latitude: 11.2445,
  longitude: 125.0025,
};

export const CAMPUS_BOUNDARIES = {
  northEast: { latitude: 11.26, longitude: 125.02 },
  southWest: { latitude: 11.23, longitude: 124.99 },
};
```

Or configure via **Campus Config** page in the admin panel.

## 🐛 Troubleshooting

### RLS Policy Error

```
new row violates row-level security policy
```

**Fix**: Make sure `.env` uses the **service_role** key (not anon key).

### Tables Not Found

```
relation "paths" does not exist
```

**Fix**: Run `supabase-fresh-setup.sql` in Supabase SQL Editor.

### Map Not Loading

1. Check internet connection (tiles load from OpenStreetMap)
2. Verify Leaflet CSS is imported
3. Check browser console for errors

## 📋 Dropdown Options

### Building Categories
Academic, Administrative, Facility, Sports, Residential, Other

### Room Types
Classroom, Laboratory, Office, Library, Lecture Hall, Conference Room, Restroom, Storage, Other

### Path Types
Walkway, Road, Stairs, Covered, Outdoor, Indoor, Corridor, Sidewalk, Elevator, Ramp, Bridge, Other

### User Roles
Admin, User, Guest

### Feedback Categories
Bug, Feature, Suggestion, Complaint, Compliment

## 📊 IT 313 Requirements Met

| Requirement | Status |
|-------------|--------|
| Login Security | ✅ Auth validation |
| Access Permissions | ✅ Role-based access |
| Audit Trail | ✅ Full action tracking |
| User Feedback | ✅ Feedback management |
| System Help | ✅ Help page |
| About Page | ✅ Project info |

## 🏗️ Build for Production

```bash
npm run build
```

Output in `dist/` directory.

## 📝 License

EVSU eMAP Admin Panel - IT 313 Database Systems Final Project

© 2025 Eastern Visayas State University

---

**Version**: 2.0.0  
**Last Updated**: December 2025
