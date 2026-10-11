import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const buildId = process.env.VERCEL_GIT_COMMIT_SHA
    || process.env.VERCEL_DEPLOYMENT_ID
    || process.env.NEXT_PUBLIC_APP_VERSION
    || (process.env.NODE_ENV === "development" ? "development" : "production-build");

  return NextResponse.json(
    { buildId, checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } },
  );
}
