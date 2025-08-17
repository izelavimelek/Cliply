import { NextResponse } from "next/server";
import { submissionCreateSchema } from "@/lib/validators";
import { createSubmission, getSubmissions } from "@/lib/db";
import { logAuditEvent } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const creatorId = searchParams.get("creatorId");
    const status = searchParams.get("status");
    
    // TODO: Get creatorId from auth context when mine=true
    const submissions = await getSubmissions({
      campaignId: campaignId || undefined,
      creatorId: creatorId || undefined,
      status: status || undefined,
    });
    
    return NextResponse.json({ 
      items: submissions, 
      page: 1, 
      total: submissions.length 
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = submissionCreateSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() }, 
        { status: 400 }
      );
    }
    
    // TODO: Get creatorId from auth context
    const submission = await createSubmission({
      ...parsed.data,
      creator_id: "temp-creator-id", // TODO: Replace with actual user ID
    });
    
    // Log audit event
    await logAuditEvent(
      null, // TODO: Get from auth context
      "submission_created",
      { 
        submission_id: submission.id, 
        campaign_id: submission.campaign_id,
        post_url: submission.post_url
      }
    );
    
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" }, 
      { status: 500 }
    );
  }
}
