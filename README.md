# Referral Program Application

A minimalist application for collecting user referrals with an image upload feature. This application uses Next.js with Supabase for backend storage and has a 5-entry limit.

## Features

- User-friendly form for submitting referrals
- Image upload capability with preview
- Displays remaining spots counter
- Limit of 5 total referrals with a graceful "maximum reached" message
- Dark/light theme support
- Responsive design

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend and storage
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## Setup Instructions

1. Clone this repository

   ```bash
   git clone [repository-url]
   cd [repository-directory]
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Create a Supabase project
   - Visit [Supabase](https://app.supabase.com/) and create a new project
   - After project creation, go to Settings > API to find your project URL and anon key

4. Set up Supabase resources:
   - Use the SQL Editor in Supabase to run the following query to create the table:
     ```sql
     create table referrals (
       id bigserial primary key,
       fullname text not null,
       email text not null,
       phone text not null,
       image_url text not null,
       created_at timestamp with time zone default now() not null
     );
     ```
   - Create a storage bucket named `referral-images` with public access (Storage > New Bucket)
   - Set bucket permissions to allow public access for the images

5. Configure environment variables
   - Rename `.env.local.example` to `.env.local`
   - Update the following variables with your Supabase project details:
     ```
     NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
     NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
     ```

6. Run the development server

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Deployment

You can deploy this application to Vercel, Netlify, or any other Next.js-compatible hosting platform. Make sure to configure the environment variables in your deployment platform's settings.
