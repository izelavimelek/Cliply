import { NextResponse } from "next/server";

type SubmissionParams = { params: { id: string } };

export async function POST(_: Request, context: unknown) {
  const { params } = context as SubmissionParams;
  // TODO: Call edge function to verify post URL and presence of caption code
  return NextResponse.json({ id: params.id, verified: false }, { status: 202 });
}
