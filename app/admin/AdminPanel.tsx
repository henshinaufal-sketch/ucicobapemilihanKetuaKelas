"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultsBoard from "../ResultsBoard";

type Tok = { token: string; usedAt: string | null };

export default function AdminPanel({ usingMemory }: { usingMemory: boolean }) {
  const router = useRouter();
  const [tokens, setTokens] = useState<Tok[]>([]);
  const [count, setCount] = useState(20);
  const [filter, setFilter] = useState<"all" | "unused" | "used">("all");
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/tokens", { cache: "no-store" });
    if (r.status === 401) return router.refresh();
    setTokens((await r.json()).tokens);
  }, [router]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const reset = async () => {
    if (!confirm(`Ini akan MENGHAPUS semua suara & token lama, lalu membuat ${count} token baru. Lanjutkan?`)) return;
    await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });
    load();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  const link = (t: string) => `${location.origin}/vote?t=${t}`;
  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const shown = tokens.filter((t) => filter === "all" || (filter === "used" ? t.usedAt : !t.usedAt));
  const unused = tokens.filter((t) => !t.usedAt);

  return (
    <>
      <div className="row between">
        <h1>Panel Admin</h1>
        <button className="btn ghost small" onClick={logout}>Keluar</button>
      </div>
      {usingMemory && (
        <p className="warn">⚠️ Database belum terhubung — memakai penyimpanan sementara (in-memory). Hubungkan Upstash Redis di Vercel sebelum dipakai sungguhan.</p>
      )}

      <section className="card">
        <h2>Hasil (live)</h2>
        <ResultsBoard />
      </section>

      <section className="card">
        <div className="row between wrap">
          <h2>Token Pemilih ({unused.length} belum dipakai / {tokens.length})</h2>
          <div className="row">
            <input type="number" min={1} max={500} value={count} onChange={(e) => setCount(Number(e.target.value))} className="num" />
            <button className="btn danger small" onClick={reset}>Reset & Buat Token</button>
          </div>
        </div>
        <div className="row wrap">
          {(["all", "unused", "used"] as const).map((f) => (
            <button key={f} className={`chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "Semua" : f === "unused" ? "Belum dipakai" : "Sudah dipakai"}
            </button>
          ))}
          <button className="chip" onClick={() => copy(unused.map((t) => `${t.token}\t${link(t.token)}`).join("\n"), "all")}>
            {copied === "all" ? "✓ Tersalin" : "Salin semua token belum dipakai"}
          </button>
        </div>
        {tokens.length === 0 ? (
          <p className="muted">Belum ada token. Klik <b>Reset &amp; Buat Token</b> untuk membuat token pemilih.</p>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Token</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {shown.map((t, i) => (
                <tr key={t.token} className={t.usedAt ? "used" : ""}>
                  <td>{i + 1}</td>
                  <td><code>{t.token}</code></td>
                  <td>{t.usedAt ? `Dipakai ${new Date(t.usedAt).toLocaleString("id-ID")}` : "Belum dipakai"}</td>
                  <td>
                    {!t.usedAt && (
                      <button className="chip" onClick={() => copy(link(t.token), t.token)}>
                        {copied === t.token ? "✓" : "Salin link"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="muted small">Bagikan satu token/link ke tiap pemilih secara pribadi. Sistem tidak menyimpan siapa memilih siapa.</p>
      </section>
    </>
  );
}
