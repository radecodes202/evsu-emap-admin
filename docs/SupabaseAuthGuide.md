# Supabase Auth Integration Guide (Admin App)

This app currently uses a local (email/password in env) auth. To switch to Supabase Auth:

## 1) Supabase setup
1. In Supabase project settings, copy the anon key and project URL.
2. Enable Email/Password in Authentication → Providers.
3. (Optional) Create an “Admin” role claim via JWT (Auth → Policies → JWT) or handle admin status in a profiles table.

## 2) Environment variables
Create/update `.env`:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## 3) Profiles table (recommended)
Link app roles to auth users:
```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text default 'user',
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists profiles_email_idx on public.profiles(email);
```
Seed an admin profile (after creating an auth user):
```sql
insert into profiles (id, email, role, is_active)
values ('<auth_user_id>', 'admin@example.com', 'admin', true)
on conflict (id) do update set role='admin', is_active=true;
```

## 4) Replace the auth client
`src/lib/supabase.js` already exports a client; ensure it uses the env vars.

## 5) Replace AuthContext with Supabase auth
- In `src/context/AuthContext.jsx`, swap local storage auth for Supabase:
  - `supabase.auth.getSession()` on init; set user and role (from profiles).
  - `supabase.auth.onAuthStateChange` to react to login/logout.
  - `login(email, password)`: call `supabase.auth.signInWithPassword({ email, password })`; fetch profile to get `role`.
  - `logout()`: `supabase.auth.signOut()`.
  - Store user/profile in context; remove manual token handling.

Pseudo:
```javascript
import { supabase } from '../lib/supabase';

// on mount
const { data: { session } } = await supabase.auth.getSession();
setUser(session?.user || null);
// fetch profile by session.user.id to get role

// login
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
// then fetch profile to set role/is_active

// logout
await supabase.auth.signOut();
```

## 6) Update ProtectedRoute
- Instead of checking `localStorage`, use `user` from AuthContext (Supabase user) and role from profile.
- If `!user`, redirect to `/login`.
- If route requires admin, check `profile.role === 'admin'`.

## 7) Adjust API calls (headers)
If you use the Supabase client for DB calls, no extra header setup needed. If you keep any Axios calls to a custom API, include the Supabase access token:
```javascript
const { data: { session } } = await supabase.auth.getSession();
api.defaults.headers.Authorization = session ? `Bearer ${session.access_token}` : '';
```

## 8) Row-Level Security (RLS) alignment
- Enable RLS on your tables and add policies that allow the anon/service role as needed for the admin app, or restrict by `auth.uid()` where appropriate.
- For audit_logs, if writing from the client, ensure an insert policy exists (see `database-audit-trail-feedback.sql`).

## 9) Login page changes
- Replace the current env-check login with a form that calls `supabase.auth.signInWithPassword`.
- On success, fetch the profile; set context; redirect.
- Add a simple error display for `error.message`.

## 10) Seeding an admin user
- In Supabase Auth → Users, invite/create `admin@example.com`.
- Set a password.
- Insert matching profile with `role='admin'`.

## 11) Testing checklist
- Sign in as admin → can access protected routes.
- Sign out → redirected to login.
- Non-admin (role user) cannot access admin-only routes.
- Audit logs still insert (verify policy).
- Maps and data fetch still work (Supabase client stays the same).

## Notes
- For production, avoid storing extra tokens in localStorage; rely on Supabase client/session.
- If you want email confirmation, enable it in Supabase Auth settings.
- If you need social providers, enable them and extend the login flow accordingly.

