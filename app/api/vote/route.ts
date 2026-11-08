import { NextResponse } from "next/server";
import { castVote, isTokenValid, normalizeToken } from "@/lib/store";
import { isCandidate } from "@/lib/candidates";

export const dynamic = "force-dynamic";

// Cek token tanpa memakainya (agar pemilih tahu tokennya valid sebelum memilih).
export async function GET(req: Request) {
  const token = normalizeToken(new URL(req.url).searchParams.get("token"));
  return NextResponse.json({ valid: token ? await isTokenValid(token) : false });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = normalizeToken(body.token);
  const candidate = String(body.candidate ?? "");
  if (!token) return NextResponse.json({ error: "Token wajib diisi." }, { status: 400 });
  if (!isCandidate(candidate)) return NextResponse.json({ error: "Kandidat tidak dikenal." }, { status: 400 });

  const ok = await castVote(token, candidate);
  if (!ok) return NextResponse.json({ error: "Token tidak valid atau sudah dipakai." }, { status: 403 });
  return NextResponse.json({ ok: true });
}
