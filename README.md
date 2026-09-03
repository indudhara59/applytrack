# ApplyTrack

ApplyTrack is a job application tracker: sign in with Google, then add, edit,
and follow up on every application in one place — company, role, status,
resume version, and follow-up dates — with a dashboard summary of where
things stand.

## Features

- Google sign-in (Auth.js), with every application scoped to the signed-in
  user
- Full CRUD for applications, plus a sortable/filterable dashboard table
- Resume upload per application, stored in Vercel Blob and linked from the
  dashboard
- Dashboard stats: total applications, a breakdown by status, and how many
  follow-ups are due in the next 7 days
- Responsive layout, empty states, and loading/error states

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com)
- [Auth.js (NextAuth v5)](https://authjs.dev) with the Google OAuth provider
- [MongoDB](https://www.mongodb.com) via the official driver (`mongodb`) and
  [Mongoose](https://mongoosejs.com), plus `@auth/mongodb-adapter` for
  session/account storage
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for resume file
  uploads, via client uploads (the file goes straight from the browser to
  Blob storage; the server only issues a short-lived upload token)

## Project structure

```
app/
├── api/
│   ├── auth/[...nextauth]/route.ts   # Auth.js route handler
│   ├── applications/route.ts          # GET (list) / POST (create)
│   ├── applications/[id]/route.ts     # GET / PATCH / DELETE one application
│   └── upload/route.ts                # Vercel Blob client-upload token handler
├── dashboard/
│   ├── page.tsx                       # Protected dashboard (stats + table)
│   ├── new/page.tsx                   # Add application
│   ├── [id]/edit/page.tsx             # Edit application
│   ├── ApplicationForm.tsx            # Shared form (new + edit)
│   ├── ApplicationsTable.tsx          # Sortable/filterable table
│   ├── StatsSummary.tsx               # Dashboard stats cards
│   ├── loading.tsx / error.tsx        # Loading + error states
├── login/page.tsx                     # Sign-in page
└── layout.tsx
lib/
├── mongodb.ts                         # Cached MongoClient + Mongoose connection
├── models/Application.ts              # Mongoose schema
├── applicationStatus.ts               # Status enum, badge colors, labels
└── applicationInput.ts                # Request-body field whitelist/coercion
auth.ts / auth.config.ts               # Auth.js config (Edge-safe split, see below)
middleware.ts                          # Protects /dashboard routes
.env.local.example                     # Required environment variables
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up MongoDB Atlas

1. Create a free account/cluster at
   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Under **Database Access**, create a database user with a username and
   password.
3. Under **Network Access**, add an IP access entry. For local development,
   your current IP is fine; for Vercel, add `0.0.0.0/0` (allow access from
   anywhere), since Vercel's serverless functions don't have static IPs.
4. Click **Connect → Drivers**, copy the connection string (it looks like
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/`), and fill in
   your database user's password. This is your `MONGODB_URI` — you can
   append a database name to the path, e.g. `.../applytrack?retryWrites=...`.

### 3. Create Google OAuth credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a project (or select an existing one).
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Choose **Web application**.
5. Add an **Authorized redirect URI** for each environment you'll use:
   - Local dev: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://<your-vercel-domain>/api/auth/callback/google`
     (add this once you know your Vercel domain — see deployment below)
6. Copy the generated **Client ID** and **Client Secret** — these are your
   `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

### 4. Set up Vercel Blob

1. In the [Vercel dashboard](https://vercel.com/dashboard), open your
   project (or create one first — see deployment below) and go to
   **Storage → Create Database → Blob**.
2. Once created, open the store's **Settings/.env.local** tab and copy the
   `BLOB_READ_WRITE_TOKEN` value.

### 5. Environment variables

Copy the example file and fill in the values from steps 2–4:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string. |
| `AUTH_SECRET` | Secret used by Auth.js to sign/encrypt tokens. Generate one with `npx auth secret`. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client credentials. |
| `BLOB_READ_WRITE_TOKEN` | Token for Vercel Blob storage. |

No secrets are hardcoded anywhere in the codebase — everything sensitive is
read from these environment variables at runtime, and `.env.local` is
git-ignored.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login), sign in
with Google, and you'll land on `/dashboard`.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In the [Vercel dashboard](https://vercel.com/new), click **Import
   Project** and select the repo. Vercel auto-detects the Next.js
   framework — no build config changes needed.
3. Before the first deploy (or right after, then redeploy), open **Settings
   → Environment Variables** and add all four variables from the table
   above (`MONGODB_URI`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`,
   `AUTH_GOOGLE_SECRET`, `BLOB_READ_WRITE_TOKEN`).
4. Deploy. Once it's live, note your Vercel domain (e.g.
   `https://applytrack.vercel.app`) and add
   `https://<your-vercel-domain>/api/auth/callback/google` as an
   **Authorized redirect URI** on the Google OAuth client from step 3 above.
5. Visit `https://<your-vercel-domain>/login` and sign in — you should land
   on a working `/dashboard`.

If you haven't created the Blob store yet, do that from within the deployed
Vercel project (Storage tab) — the token from step 4 above will already be
scoped to it.
