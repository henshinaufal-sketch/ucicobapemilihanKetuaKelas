"use client";
import { useEffect, useState } from "react";

type Data = {
  results: { id: string; name: string; image: string; votes: number }[];
  total: number;
  voters: { total: number; voted: number };
};

export default function ResultsBoard({ interval = 3000 }: { interval?: number }) {
  const [data, setData] = useState<Data | null>(null);
  const [updated, setUpdated] = useState<string>("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/results", { cache: "no-store" });
        if (r.ok && alive) {
          setData(await r.json());
          setUpdated(new Date().toLocaleTimeString("id-ID"));
        }
      } catch {}
    };
    load();
    const t = setInterval(load, interval);
    return () => { alive = false; clearInterval(t); };
  }, [interval]);

  if (!data) return <p className="muted">Memuat hasil…</p>;
  const max = Math.max(...data.results.map((r) => r.votes));
  const sorted = [...data.results].sort((a, b) => b.votes - a.votes);
  const pct = data.voters.total ? Math.round((data.voters.voted / data.voters.total) * 100) : 0;

  return (
    <div>
      <div className="stats">
        <div className="stat"><b>{data.total}</b><span>suara masuk</span></div>
        <div className="stat"><b>{data.voters.voted}/{data.voters.total}</b><span>pemilih sudah memilih</span></div>
        <div className="stat"><b>{pct}%</b><span>partisipasi</span></div>
      </div>
      <div className="results">
        {sorted.map((r) => {
          const share = data.total ? (r.votes / data.total) * 100 : 0;
          const leading = data.total > 0 && r.votes === max;
          return (
            <div key={r.id} className={`result ${leading ? "leading" : ""}`}>
              <img src={r.image} alt={r.name} />
              <div className="result-body">
                <div className="result-head">
                  <strong>{r.name} {leading && <span className="badge">Unggul</span>}</strong>
                  <span>{r.votes} suara · {share.toFixed(1)}%</span>
                </div>
                <div className="bar"><div style={{ width: `${share}%` }} /></div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="muted live"><span className="dot" /> Live · diperbarui otomatis tiap {interval / 1000} detik · terakhir {updated}</p>
    </div>
  );
}
