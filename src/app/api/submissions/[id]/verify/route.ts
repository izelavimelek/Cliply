import { NextRequest, NextResponse } from "next/server";
import { updateSubmission } from "@/lib/db";
import { ObjectId } from "mongodb";

type SubmissionParams = { params: { id: string } };

// Helper function to get user from auth token
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = JSON.parse(atob(token));
    
    // Check if token is expired
    if (decoded.exp < Date.now()) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isAdmin: decoded.isAdmin,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest, context: unknown) {
  try {
    const { params } = context as SubmissionParams;
    const { id: submissionId } = params;
    
    if (!ObjectId.isValid(submissionId)) {
      return NextResponse.json(
        { error: "Invalid submission ID format" },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "brand") {
      return NextResponse.json(
        { error: "Access denied. Brand role required." },
        { status: 403 }
      );
    }

    const updateData = await request.json();
    
    // Validate required fields
    if (updateData.status && !['pending', 'approved', 'rejected'].includes(updateData.status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update submission
    const updatedSubmission = await updateSubmission(submissionId, {
      status: updateData.status,
      feedback: updateData.feedback,
      verified_at: updateData.status !== 'pending' ? new Date() : undefined,
    });

    if (!updatedSubmission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Submission updated successfully",
      submission: updatedSubmission
    });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}
