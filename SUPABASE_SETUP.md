# Supabase Integration Setup Guide

This guide will help you set up Supabase for the EVSUeMAP Admin Panel.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project created

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: `evsu-emap` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for the project to be created (takes a few minutes)

## Step 2: Set Up Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Open the `database-setup.sql` file from the project root
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** to execute the SQL
6. Verify that all tables were created successfully:
   - `buildings`
   - `locations`
   - `points_of_interest`
   - `routes`

## Step 3: Configure Environment Variables

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **service_role** key (⚠️ Keep this secret! It has full database access)

3. Create a `.env` file in the `evsu-emap-admin` root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_SERVICE_KEY=your-service-role-key-here
```

4. Replace the placeholder values with your actual Supabase credentials

## Step 4: Set Up Storage (Optional - for building images)

If you want to upload building images:

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Name it: `building-images`
4. Make it **Public**
5. The `buildingService.uploadImage()` method will work automatically

## Step 5: Verify Installation

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Buildings page
3. You should see the sample buildings that were inserted by the SQL script
4. Try creating, editing, or deleting a building to verify everything works

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure your `.env` file exists in the project root
- Verify the variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_SERVICE_KEY`
- Restart your dev server after creating/updating `.env`

### Error: "Row Level Security policy violation"
- Check that you ran the `database-setup.sql` script completely
- Verify the RLS policies were created in the Supabase dashboard (Settings → Database → Policies)

### Error: "Invalid API key"
- Double-check that you copied the **service_role** key (not the anon key)
- Make sure there are no extra spaces or quotes in your `.env` file

### Buildings not showing up
- Check the Supabase dashboard → Table Editor → buildings
- Verify the sample data was inserted correctly
- Check the browser console for any error messages

## Database Schema Overview

### Buildings Table
- `id` (UUID, Primary Key)
- `name` (Text) - Building name
- `code` (Text, Unique) - Building code (e.g., "MB", "COE")
- `description` (Text, Optional)
- `latitude` (Decimal) - Latitude coordinate
- `longitude` (Decimal) - Longitude coordinate
- `category` (Text) - academic, administrative, facility, sports, residential, other
- `image_url` (Text, Optional) - URL to building image
- `geom` (Geography Point) - Auto-calculated from lat/lng
- `created_at`, `updated_at` (Timestamps)

### Locations Table
- `id` (UUID, Primary Key)
- `building_id` (UUID, Foreign Key) - References buildings
- `room_number` (Text, Optional)
- `name` (Text) - Room/location name
- `floor` (Integer, Optional)
- `description` (Text, Optional)
- `type` (Text, Optional)
- `capacity` (Integer, Optional)
- `created_at` (Timestamp)

### Points of Interest Table
- `id` (UUID, Primary Key)
- `name` (Text)
- `description` (Text, Optional)
- `latitude`, `longitude` (Decimal)
- `category` (Text) - parking, food, service, etc.
- `icon` (Text, Optional)
- `image_url` (Text, Optional)
- `geom` (Geography Point)
- `created_at` (Timestamp)

## Security Notes

- The **service_role** key bypasses Row Level Security (RLS)
- This is appropriate for the admin panel which needs full access
- **Never** commit your `.env` file to version control
- The mobile app will use the **anon** key (read-only access)

## Next Steps

After setting up the admin panel:
1. Set up the mobile app integration (see main instructions)
2. Test CRUD operations thoroughly
3. Add more features like image uploads, location management, etc.
