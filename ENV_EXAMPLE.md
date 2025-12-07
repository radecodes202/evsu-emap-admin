# .env.example Template

Since `.env.example` is filtered by gitignore, here's the template you should create manually:

Create a file named `.env.example` in the project root with the following content:

```bash
# Supabase Configuration
# Copy this file to .env and fill in your actual values
# Get these values from your Supabase project settings (Settings → API)

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_SERVICE_KEY=your-service-role-key-here

# Admin Panel Authentication
# Configure these for local authentication (optional)
VITE_ADMIN_EMAIL=admin@evsu.edu.ph
VITE_ADMIN_PASSWORD=admin123

# ⚠️ SECURITY WARNING:
# - NEVER commit the actual .env file to version control
# - The service_role key has FULL ACCESS to your database
# - Keep credentials secure and rotate them if exposed
# - Use different credentials for production environments
```

## Instructions

1. Copy this content to a new file named `.env.example` in your project root
2. Commit the `.env.example` file (it's safe to commit - no real credentials)
3. Other developers can copy `.env.example` to `.env` and fill in their actual values
