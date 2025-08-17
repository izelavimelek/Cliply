import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!secret || secret !== process.env.VERCEL_CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // TODO: Poll YouTube view counts and append snapshots
  return NextResponse.json({ ok: true });
}
