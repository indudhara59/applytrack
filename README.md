# ApplyTrack

ApplyTrack is a job application tracker. This stage sets up the project
foundation: authentication and database wiring, with a protected dashboard
page as proof the flow works end to end.

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com)
- [Auth.js (NextAuth v5)](https://authjs.dev) with the Google OAuth provider
- [MongoDB](https://www.mongodb.com) via the official driver (`mongodb`) and
  [Mongoose](https://mongoosejs.com), plus `@auth/mongodb-adapter` for
  session/account storage
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for file storage
  (e.g. resumes/cover letters in a later stage)

## Project structure

```
app/
├── api/auth/[...nextauth]/route.ts   # Auth.js route handler
├── dashboard/page.tsx                 # Protected page
├── login/page.tsx                     # Sign-in page
└── layout.tsx
lib/
└── mongodb.ts                         # Cached MongoClient + Mongoose connection
auth.ts                                # Auth.js config (providers, adapter)
middleware.ts                          # Protects /dashboard routes
.env.local.example                     # Required environment variables
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in the values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string. Easiest option: create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), then use its connection string. |
| `AUTH_SECRET` | Secret used by Auth.js to sign/encrypt tokens. Generate one with `npx auth secret`. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client credentials (see below). |
| `BLOB_READ_WRITE_TOKEN` | Token for Vercel Blob storage. Create a Blob store in your [Vercel dashboard](https://vercel.com/dashboard) under Storage, and copy the token from its `.env.local` tab. Not required to run the auth flow in this stage. |

### 3. Create Google OAuth credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a project (or select an existing one).
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Choose **Web application**.
5. Add an **Authorized redirect URI**:
   - Local dev: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://<your-domain>/api/auth/callback/google`
6. Copy the generated **Client ID** and **Client Secret** into `AUTH_GOOGLE_ID`
   and `AUTH_GOOGLE_SECRET` in `.env.local`.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login), sign in
with Google, and you should land on `/dashboard`.

No secrets are hardcoded anywhere in the codebase — everything sensitive is
read from environment variables at runtime.
