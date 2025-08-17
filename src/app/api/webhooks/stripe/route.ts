import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Verify Stripe signature and handle events
  return NextResponse.json({ received: true });
}
