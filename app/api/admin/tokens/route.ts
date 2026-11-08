import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { listTokens } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ tokens: await listTokens() });
}
