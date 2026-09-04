import { NextRequest, NextResponse } from "next/server";
import dbConnect, { getMongoClient } from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import { checkRateLimit } from "@/lib/rateLimit";

const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

/**
 * Called by the ApplyTrack Chrome extension, which has no session cookie —
 * auth is a per-user API key (see app/dashboard/settings) sent as the
 * x-api-key header instead of the usual Auth.js session.
 */
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const client = await getMongoClient();
  const userDoc = await client.db().collection("users").findOne({ apiKey });
  if (!userDoc) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  if (!checkRateLimit(apiKey, RATE_LIMIT, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Rate limit exceeded — try again shortly" },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const company =
    typeof body?.company === "string" ? body.company.trim() : "";
  const role = typeof body?.role === "string" ? body.role.trim() : "";
  const jobPostingUrl =
    typeof body?.jobPostingUrl === "string" ? body.jobPostingUrl.trim() : "";

  if (!company || !role || !jobPostingUrl) {
    return NextResponse.json(
      { error: "company, role, and jobPostingUrl are required" },
      { status: 400 }
    );
  }

  const userId = String(userDoc._id);
  await dbConnect();

  const existing = await Application.findOne({ userId, jobPostingUrl });
  if (existing) {
    return NextResponse.json(existing);
  }

  const application = await Application.create({
    userId,
    company,
    role,
    jobPostingUrl,
    status: "Applied",
    dateApplied: new Date(),
  });

  return NextResponse.json(application, { status: 201 });
}
