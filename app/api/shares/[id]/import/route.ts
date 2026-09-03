import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import SharedJob from "@/lib/models/SharedJob";

export async function POST(
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
  const share = await SharedJob.findOne({
    _id: params.id,
    toUserId: session.user.id,
  });

  if (!share) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const application = await Application.create({
    userId: session.user.id,
    company: share.company,
    role: share.role,
    jobPostingUrl: share.jobPostingUrl,
    status: "Not Applied",
  });

  await SharedJob.deleteOne({ _id: share._id });

  return NextResponse.json(application, { status: 201 });
}
