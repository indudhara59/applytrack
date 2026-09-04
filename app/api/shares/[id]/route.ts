import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import SharedJob from "@/lib/models/SharedJob";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await dbConnect();
  // Marked dismissed rather than deleted, so the sender can still see it
  // was seen and declined.
  const share = await SharedJob.findOneAndUpdate(
    { _id: params.id, toUserId: session.user.id, status: "pending" },
    { $set: { status: "dismissed" } }
  );

  if (!share) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
