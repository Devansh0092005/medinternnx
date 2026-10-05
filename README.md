# MedInternX — Real Registration + Course Unlocking + Progress

This version uses GitHub Pages for the frontend and Supabase for authentication/database.

## What works after Supabase setup
- Real email/password student registration
- Real login/logout
- Student profile
- Course/internship enrollment
- Course unlock after enrollment
- Modules
- Progress saved to the database
- Completion percentage
- 100% completion detection
- Certificate options message only after completion
- RLS policies so students can access only their own profile/enrollment/progress

Supabase Auth provides email/password authentication and integrates with Postgres/RLS. Keep the browser key publishable/anon only; never put a service-role/secret key in config.js.

## Setup — about 10 minutes

### 1. Create a Supabase project
Create a free Supabase project at https://supabase.com/

### 2. Create the database
Open Supabase -> SQL Editor.
Paste everything from `supabase_setup.sql`.
Click Run.

### 3. Get project credentials
In Supabase, open your project's Connect/API settings and copy:
- Project URL
- Publishable key (or anon key for projects that still expose it)

Open `config.js` and replace:
YOUR_SUPABASE_URL
YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY

Do NOT use a service_role or secret key in the website.

### 4. Authentication email setting
Supabase Auth can require email confirmation. If you want immediate login during testing, adjust the email confirmation setting in Supabase Authentication settings. For production, use a verified email flow.

### 5. GitHub Pages
Upload these files to the ROOT of your `medinternnx` repository:
- index.html
- style.css
- config.js
- script.js
- supabase_setup.sql
- README.md

Do not upload a ZIP inside the repository.

### 6. Test
Open:
https://devansh0092005.github.io/medinternnx/

Register -> Login -> choose a course -> Enroll / unlock -> dashboard -> mark modules complete.

## Certificate / ₹49 rule
This frontend intentionally does not display the ₹49 certificate fee before completion. At 100% completion it shows the certificate-options stage. Payment and certificate generation can be connected next (e.g. Stripe/Razorpay + a secure server/Edge Function).

## Security
RLS is enabled for profiles, enrollments and module progress. Never expose Supabase service-role/secret keys in browser code.
