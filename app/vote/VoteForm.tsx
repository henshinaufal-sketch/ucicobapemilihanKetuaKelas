"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CANDIDATES } from "@/lib/candidates";

type Step = "token" | "choose" | "done";

export default function VoteForm() {
  const params = useSearchParams();
  const [token, setToken] = useState("");
  const [step, setStep] = useState<Step>("token");
  const [choice, setChoice] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const checkToken = async (t: string) => {
    setBusy(true); setError("");
    const r = await fetch(`/api/vote?token=${encodeURIComponent(t)}`, { cache: "no-store" });
    const { valid } = await r.json();
    setBusy(false);
    if (valid) setStep("choose");
    else setError("Token tidak valid atau sudah dipakai.");
  };

  // Dukung tautan langsung: /vote?t=XXXX-XXXX
  useEffect(() => {
    const t = params.get("t");
    if (t) { setToken(t.toUpperCase()); checkToken(t); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!choice) return;
    const name = CANDIDATES.find((c) => c.id === choice)?.name;
    if (!confirm(`Yakin memilih ${name}? Pilihan tidak dapat diubah.`)) return;
    setBusy(true); setError("");
    const r = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, candidate: choice }),
    });
    const data = await r.json();
    setBusy(false);
    if (r.ok) setStep("done");
    else { setError(data.error ?? "Gagal mengirim suara."); if (r.status === 403) setStep("token"); }
  };

  if (step === "done")
    return (
      <div className="card center">
        <div className="big">✅</div>
        <h1>Terima kasih!</h1>
        <p>Suaramu sudah tercatat. Token ini sekarang hangus dan tidak bisa dipakai lagi.</p>
        <Link href="/" className="btn">Lihat hasil sementara</Link>
      </div>
    );

  if (step === "token")
    return (
      <div className="card narrow">
        <h1>Masukkan Token</h1>
        <p className="muted">Setiap pemilih mendapat satu token dari panitia. Token hanya bisa dipakai sekali.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (token.trim()) checkToken(token); }}>
          <input
            className="token-input"
            value={token}
            onChange={(e) => setToken(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX"
            autoFocus
            autoComplete="off"
          />
          {error && <p className="error">{error}</p>}
          <button className="btn full" disabled={busy || !token.trim()}>{busy ? "Memeriksa…" : "Lanjut"}</button>
        </form>
      </div>
    );

  return (
    <>
      <h1>Pilih Ketua Kelas</h1>
      <p className="muted">Token <code>{token}</code> valid. Klik salah satu kandidat, lalu tekan <b>Kirim Suara</b>.</p>
      <div className="candidates">
        {CANDIDATES.map((c) => (
          <button key={c.id} className={`candidate ${choice === c.id ? "selected" : ""}`} onClick={() => setChoice(c.id)}>
            <img src={c.image} alt={c.name} />
            <strong>{c.name}</strong>
            <span className="muted">“{c.motto}”</span>
          </button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button className="btn ghost" onClick={() => { setStep("token"); setChoice(null); }}>Kembali</button>
        <button className="btn" disabled={!choice || busy} onClick={submit}>{busy ? "Mengirim…" : "Kirim Suara"}</button>
      </div>
    </>
  );
}
