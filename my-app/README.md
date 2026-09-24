# TrailTrips

Use Node.js 24 LTS (`nvm use`).

Next.js trip planner with Supabase Google authentication and private, account-owned itineraries. The six mock trails remain in `lib/data/mock.ts`. New accounts start with no trips; shared demo trips are not imported.

## Supabase setup

1. Create a Supabase project. In **Connect** or **Settings → API Keys**, copy the project URL and publishable key.
2. Copy `.env.example` to `.env.local` and fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. These are public configuration values. Do not use a secret/service-role key in the app.
3. Apply `supabase/migrations/202609240001_user_trips.sql` once through the Supabase SQL Editor. Alternatively, authenticate the CLI with `supabase login`, then from this directory run `supabase link --project-ref YOUR_PROJECT_REF` and `supabase db push`.
4. In Supabase **Authentication → URL Configuration**, set the Site URL to your app origin (`http://localhost:3000` for development) and add `http://localhost:3000/auth/callback**` to Redirect URLs. Add the equivalent production callback URL when deploying. The suffix permits the encoded `next` query used to return to the requested page.
5. In Google Cloud's **Google Auth Platform**, configure branding/audience and create an OAuth client of type **Web application**. Enable the `openid`, email, and profile scopes. Add `http://localhost:3000` and your production origin as authorized JavaScript origins. Add `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` as an authorized redirect URI (copy the precise URL from Supabase's Google provider page). If the consent app is in Testing, add your Google account as a test user.
6. In Supabase **Authentication → Sign In / Providers → Google**, enable Google and paste the Google OAuth client ID and client secret. Keep that secret in Supabase; it is not needed in `.env.local` or in chat.
7. Run `npm install` and `npm run dev`. Restart the server after changing environment variables. Set the same public Supabase variables in the deployment environment before building.

Google setup reference: https://supabase.com/docs/guides/auth/social-login/auth-google

## Data and authorization

- Google identity, email, and display name come from Supabase Auth. No hardcoded user profile.
- `trips.user_id` references `auth.users`. `trip_days` belong to trips; `trip_stops` belong to days and reference the mock catalog's trail IDs.
- Row-level security on all three tables prevents anonymous access and isolates each user's rows. The `create_trip` function uses caller permissions and creates trips/days in one transaction.
- Auth uses `@supabase/ssr` browser/server helpers with PKCE and cookie-based sessions. `proxy.ts` verifies and refreshes sessions with `getClaims()`, and `/auth/callback` exchanges the OAuth code on the server. Private trip requests still use the signed-in user’s token and database RLS. Server-side data fetching should use `lib/supabase/server.ts` and verify identity before returning private data.
- Explore and trail details are public. Adding trails and creating/viewing personal trips require sign-in. The profile menu shows account details, navigation, and sign-out. Trip creation uses a four-step animated wizard with a review before saving.
- Signing out or changing accounts clears in-memory trip data. The previous shared `trailtrips-planner-v1` local-storage cache is discarded.
- Create/add/remove wait for database success and display errors. Stops are separate rows, so concurrent additions do not overwrite the entire itinerary.
- Basecamp coordinates, driving times, and daylight calculations are not implemented; they do not inherit Oregon's demo values.

## Validation

`npm test` executes the production migration against embedded PostgreSQL (PGlite) with Supabase-compatible auth roles, checking anonymous denial, cross-user read/write isolation, ownership transfer prevention, and transaction rollback. Store tests check account-switch races and failed writes. Run `npm run lint` and `npm run build` as well. If the local sandbox blocks Turbopack worker ports, `npm run build -- --webpack` is the supported fallback.

After cloud configuration, test with two Google accounts: create/add/remove a trip stop, refresh to confirm persistence, sign out, sign into the second account, and confirm it cannot see or modify the first account's trips. Real Google OAuth needs configured Supabase/Google credentials and cannot be validated by the local SQL tests.
