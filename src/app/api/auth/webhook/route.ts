import { NextResponse } from "next/server";
import { createProfile } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (TODO: implement proper verification)
    if (body.type !== 'INSERT' || body.table !== 'users') {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
    }
    
    const userId = body.record.id;
    const email = body.record.email;
    
    // Create profile for new user
    await createProfile({
      id: userId,
      display_name: email?.split('@')[0] || 'User',
      role: null, // Will be set during onboarding
      is_admin: false,
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in auth webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" }, 
      { status: 500 }
    );
  }
}
