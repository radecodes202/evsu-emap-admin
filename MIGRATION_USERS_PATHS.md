# Users and Paths Migration to Supabase

This guide explains how to enable the Users and Paths features by migrating them to Supabase.

## Step 1: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the `database-migration-users-paths.sql` file from the project root
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute the SQL

This will create:
- `admin_users` table - for user management
- Enhanced `routes` table - adds columns for path management (path_name, path_type, is_active, description)
- `waypoints` table - for storing path waypoints
- All necessary indexes and policies

## Step 2: Verify Tables Created

After running the migration, verify in Supabase:
1. Go to **Table Editor**
2. You should see:
   - `admin_users` table
   - `routes` table (with new columns)
   - `waypoints` table

## Step 3: Test the Features

### Users Page
1. Navigate to **Users** in the admin panel
2. You should see the default admin user (admin@evsu.edu.ph)
3. Try creating a new user
4. Try editing/deleting users

### Paths Page
1. Navigate to **Paths & Walkways** in the admin panel
2. The page should load without errors
3. Try creating a new path
4. Try adding waypoints to paths

## What Was Created

### Services
- `src/services/userService.js` - User CRUD operations
- `src/services/pathService.js` - Path/Route CRUD operations with waypoints

### Hooks
- `src/hooks/useUsers.js` - React Query hooks for users
- `src/hooks/usePaths.js` - React Query hooks for paths

### Updated Pages
- `src/pages/UsersPage.jsx` - Now uses Supabase
- `src/pages/PathsPage.jsx` - Now uses Supabase

## Database Schema

### admin_users Table
- `id` (UUID, Primary Key)
- `email` (Text, Unique) - User email
- `name` (Text) - User full name
- `password_hash` (Text, Optional) - For future password hashing
- `role` (Text) - 'admin' or 'user'
- `is_active` (Boolean) - Whether user is active
- `created_at`, `updated_at` (Timestamps)

### routes Table (Enhanced)
- All original columns from `database-setup.sql`
- **New:** `path_name` (Text) - Name of the path
- **New:** `path_type` (Text) - Type of path (walkway, road, etc.)
- **New:** `is_active` (Boolean) - Whether path is active
- **New:** `description` (Text) - Path description

### waypoints Table
- `id` (UUID, Primary Key)
- `route_id` (UUID, Foreign Key) - References routes
- `sequence_order` (Integer) - Order of waypoint in path
- `latitude`, `longitude` (Decimal) - Waypoint coordinates
- `name` (Text, Optional) - Waypoint name
- `description` (Text, Optional) - Waypoint description
- `created_at` (Timestamp)

## Security

- All tables have Row Level Security (RLS) enabled
- Public read access for viewing
- Service role has full access (for admin panel)
- Waypoints are automatically deleted when a route is deleted (CASCADE)

## Next Steps

After migration:
1. Test all CRUD operations
2. Update PathFormPage to use the new pathService
3. Consider adding user authentication with Supabase Auth (optional)
4. Add more features like path visualization on map

## Troubleshooting

### Error: "relation 'admin_users' does not exist"
- Make sure you ran the `database-migration-users-paths.sql` script
- Check that the table was created in Supabase Table Editor

### Error: "column 'path_name' does not exist"
- The migration script should have added this column automatically
- If it failed, you can manually add it:
  ```sql
  ALTER TABLE routes ADD COLUMN IF NOT EXISTS path_name TEXT;
  ```

### Users/Paths not showing up
- Check that RLS policies are set correctly
- Verify your service_role key is configured in .env
- Check browser console for specific error messages
