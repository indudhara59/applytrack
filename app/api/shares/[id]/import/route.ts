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
    status: "pending",
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
    // Without a date, this would silently never show up in the "by date"
    // chart or the calendar (both group by dateApplied and skip anything
    // missing one) — the day it's added to the tracker is as good a date
    // as any, same as the "new application" form defaulting to today.
    dateApplied: new Date(),
  });

  // Kept (not deleted) so the sender can later see this was acted on, and
  // can see how the resulting application progresses.
  share.status = "imported";
  share.resultingApplicationId = application._id.toString();
  await share.save();

  return NextResponse.json(application, { status: 201 });
}
