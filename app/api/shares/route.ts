import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect, { getMongoClient } from "@/lib/mongodb";
import SharedJob from "@/lib/models/SharedJob";
import { normalizeUsername } from "@/lib/username";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const toUsername = normalizeUsername(String(body.toUsername ?? ""));
  const company = String(body.company ?? "").trim();
  const role = String(body.role ?? "").trim();
  const jobPostingUrl = String(body.jobPostingUrl ?? "").trim();
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!toUsername || !company || !role || !jobPostingUrl) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const client = await getMongoClient();
  const users = client.db().collection("users");

  const recipient = await users.findOne({ username: toUsername });
  if (!recipient) {
    return NextResponse.json(
      { error: "No user found with that username" },
      { status: 404 }
    );
  }
  if (recipient._id.toString() === session.user.id) {
    return NextResponse.json(
      { error: "You can't share a job with yourself" },
      { status: 400 }
    );
  }

  const sender = await users.findOne({ _id: new ObjectId(session.user.id) });

  await dbConnect();
  const share = await SharedJob.create({
    fromUserId: session.user.id,
    fromUsername: sender?.username ?? session.user.email ?? "Someone",
    toUserId: recipient._id.toString(),
    toUsername,
    company,
    role,
    jobPostingUrl,
    note,
  });

  return NextResponse.json(share, { status: 201 });
}
