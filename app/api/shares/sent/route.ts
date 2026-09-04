import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import SharedJob from "@/lib/models/SharedJob";
import { getResultingStatusMap } from "@/lib/shares";

/** Full history of jobs the current user has shared with others. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const shares = await SharedJob.find({ fromUserId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const statusByApplicationId = await getResultingStatusMap(shares);

  return NextResponse.json(
    shares.map((doc) => ({
      _id: String(doc._id),
      toUsername: doc.toUsername,
      company: doc.company,
      role: doc.role,
      jobPostingUrl: doc.jobPostingUrl,
      status: doc.status,
      currentApplicationStatus: doc.resultingApplicationId
        ? (statusByApplicationId.get(doc.resultingApplicationId) ?? null)
        : null,
    }))
  );
}
