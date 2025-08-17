import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!secret || secret !== process.env.VERCEL_CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // TODO: Compute payouts based on snapshots and budgets
  return NextResponse.json({ ok: true });
}
