import { Redis } from "@upstash/redis";
import { randomBytes } from "crypto";
import { CANDIDATES } from "./candidates";

/*
 * Penyimpanan:
 *  - tokens:unused  (SET)  token yang belum dipakai
 *  - tokens:used    (HASH) token -> waktu dipakai (TIDAK menyimpan pilihan → suara tetap rahasia)
 *  - votes          (HASH) kandidat -> jumlah suara
 */
const K = { unused: "tokens:unused", used: "tokens:used", votes: "votes" };

// Konsumsi token + tambah suara dalam satu operasi atomik: token hanya bisa dipakai sekali
// walaupun dikirim bersamaan dari dua perangkat.
const VOTE_LUA = `
if redis.call('SREM', KEYS[1], ARGV[1]) == 1 then
  redis.call('HINCRBY', KEYS[2], ARGV[2], 1)
  redis.call('HSET', KEYS[3], ARGV[1], ARGV[3])
  return 1
end
return 0`;

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

// Fallback in-memory untuk pengembangan lokal (JS single-thread → tetap atomik).
const g = globalThis as unknown as { __mem?: { unused: Set<string>; used: Map<string, string>; votes: Map<string, number> } };
const mem = (g.__mem ??= { unused: new Set(), used: new Map(), votes: new Map() });

export const usingMemory = !redis;

export type TokenInfo = { token: string; usedAt: string | null };

export async function castVote(tok: string, candidateId: string): Promise<boolean> {
  const now = new Date().toISOString();
  if (redis) {
    const r = await redis.eval(VOTE_LUA, [K.unused, K.votes, K.used], [tok, candidateId, now]);
    return Number(r) === 1;
  }
  if (!mem.unused.delete(tok)) return false;
  mem.votes.set(candidateId, (mem.votes.get(candidateId) ?? 0) + 1);
  mem.used.set(tok, now);
  return true;
}

export async function isTokenValid(tok: string): Promise<boolean> {
  if (redis) return (await redis.sismember(K.unused, tok)) === 1;
  return mem.unused.has(tok);
}

export async function getResults() {
  let raw: Record<string, unknown> = {};
  let unused = 0;
  let used = 0;
  if (redis) {
    const [v, u, us] = await Promise.all([redis.hgetall(K.votes), redis.scard(K.unused), redis.hlen(K.used)]);
    raw = v ?? {};
    unused = u;
    used = us;
  } else {
    raw = Object.fromEntries(mem.votes);
    unused = mem.unused.size;
    used = mem.used.size;
  }
  const results = CANDIDATES.map((c) => ({ ...c, votes: Number(raw[c.id] ?? 0) }));
  const total = results.reduce((s, r) => s + r.votes, 0);
  return { results, total, voters: { total: unused + used, voted: used } };
}

export async function listTokens(): Promise<TokenInfo[]> {
  let unused: string[];
  let used: Record<string, string>;
  if (redis) {
    unused = await redis.smembers(K.unused);
    used = ((await redis.hgetall(K.used)) as Record<string, string>) ?? {};
  } else {
    unused = [...mem.unused];
    used = Object.fromEntries(mem.used);
  }
  return [
    ...unused.map((t) => ({ token: t, usedAt: null })),
    ...Object.entries(used).map(([t, at]) => ({ token: t, usedAt: String(at) })),
  ].sort((a, b) => a.token.localeCompare(b.token));
}

// Tanpa huruf/angka yang mirip (0/O, 1/I/L) agar mudah diketik.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function newToken() {
  const bytes = randomBytes(8);
  let s = "";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

/** Hapus semua data (token + suara) lalu buat `count` token baru. */
export async function resetElection(count: number): Promise<string[]> {
  const set = new Set<string>();
  while (set.size < count) set.add(newToken());
  const tokens = [...set];
  if (redis) {
    const p = redis.multi();
    p.del(K.unused, K.used, K.votes);
    p.sadd(K.unused, tokens[0], ...tokens.slice(1));
    await p.exec();
  } else {
    mem.unused = new Set(tokens);
    mem.used.clear();
    mem.votes.clear();
  }
  return tokens;
}

export const normalizeToken = (t: unknown) =>
  typeof t === "string" ? t.trim().toUpperCase().replace(/\s+/g, "") : "";
