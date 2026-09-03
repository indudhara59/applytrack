import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import { pickApplicationFields } from "@/lib/applicationInput";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const applications = await Application.find({
    userId: session.user.id,
  }).sort({ dateApplied: -1 });

  return NextResponse.json(applications);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const fields = pickApplicationFields(body);

  if (!fields.company || !fields.role) {
    return NextResponse.json(
      { error: "company and role are required" },
      { status: 400 }
    );
  }

  await dbConnect();
  const application = await Application.create({
    ...fields,
    userId: session.user.id,
  });

  return NextResponse.json(application, { status: 201 });
}
