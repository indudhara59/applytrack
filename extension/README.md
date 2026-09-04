# ApplyTrack Capture (Chrome extension)

A Manifest V3 Chrome extension that watches LinkedIn job pages and, when it
sees the "application sent" confirmation, automatically adds the job to your
ApplyTrack dashboard — no manual data entry.

This is for personal/local use only. It is **not** published to the Chrome
Web Store — you load it unpacked, and your API key never leaves
`chrome.storage.local` (it's read only by this extension, on your machine).

## 1. Load it unpacked

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this `extension/` folder.
4. The "ApplyTrack Capture" icon should appear in your toolbar (pin it via
   the puzzle-piece menu if you don't see it).

Whenever you pull changes to the files in this folder, come back to
`chrome://extensions` and click the reload icon on the extension's card.

## 2. Get your API key

1. In the ApplyTrack web app, sign in and go to **Dashboard → Settings**
   (`/dashboard/settings`).
2. Click **Generate Key** (or **Generate New Key** if you already have one —
   note that this invalidates any key currently saved in the extension).
3. Click **Reveal**, then **Copy**.
4. Click the ApplyTrack Capture icon in Chrome's toolbar, paste the key into
   **API key**, set **ApplyTrack site URL** to wherever the app is running
   (your deployed Vercel URL, or `http://localhost:3000` for local dev), and
   click **Save**.

The status line at the bottom of the popup should read "Connected" once
both fields are saved.

## 3. Use it

Apply to a job on LinkedIn as normal (Easy Apply or external Apply). When
LinkedIn shows its "application sent" confirmation, the extension detects
it, extracts the job title/company/URL, and sends it to ApplyTrack. A small
toast appears in the bottom-right corner of the page:

- **✓ Added to ApplyTrack** — it worked.
- **⚠ ApplyTrack: couldn't save — check extension settings** — something
  failed (no API key saved, the site URL is wrong, a network error, etc.).
  Check the browser console (right-click the page → Inspect → Console) for
  the specific error logged there.

If a particular job page's layout confuses the detector, open the popup on
that job page and click **Capture this job now** to re-run the same
extraction/send logic manually.

## When capture stops working

LinkedIn changes its page structure fairly often, and this extension has no
official API to rely on instead — it reads the DOM directly, so a LinkedIn
redesign can break it. If jobs stop being captured (or the wrong
title/company gets saved):

1. Open a LinkedIn job page, right-click → **Inspect**, and find the actual
   class names LinkedIn is currently using for the job title and company
   name near the top of the job details panel.
2. Open `content.js` and update:
   - `JOB_TITLE_SELECTORS` — CSS selectors tried in order for the job title
   - `COMPANY_SELECTORS` — CSS selectors tried in order for the company name
   - `CONFIRMATION_PHRASES` — lowercase text fragments that indicate the
     "application sent" confirmation appeared, if LinkedIn changes that
     wording
3. Reload the extension at `chrome://extensions` and try again.

Each selector list has several fallbacks tried in order, so adding a new
selector at the front (rather than replacing the list) is usually the
safest fix.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Extension config — permissions, content script, popup |
| `background.js` | Service worker; makes the actual API request (avoids CORS issues that a content-script fetch to an arbitrary site would hit) |
| `content.js` | Runs on `linkedin.com/jobs/*`; detects the confirmation, extracts job info, shows the on-page toast |
| `popup.html` / `popup.js` | Settings UI — API key, site URL, connection status, manual capture button |
