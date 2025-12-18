# Fixes Summary

Summary of bug fixes and improvements.

- **MongoDB Connection**: Updated `lib/mongodb.ts` to correctly handle production environments (Vercel) by throwing an error if `MONGODB_URI` is missing, preventing accidental `localhost` connection attempts.
- **Environment Variables**: Added `MONGODB_URI` to `.env.local.example` as a required variable.
- **One-Time Free Use**: Implemented server-side cookie tracking (`codewiki_guest_usage`) to restrict unauthenticated users to a single repository analysis. Subsequent attempts return a 403 error prompting signup.
- **Frontend Handling**: Updated `app/analyze/page.tsx` to handle 403 errors by displaying a "Free limit reached" message with a signup link.
- **Current Status**: Project deployed to Vercel. Database connection fixed. Usage limits active.
