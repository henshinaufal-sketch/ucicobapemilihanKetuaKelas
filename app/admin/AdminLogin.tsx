"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) router.refresh();
    else setError((await r.json()).error ?? "Gagal login");
  };

  return (
    <div className="card narrow">
      <h1>Login Admin</h1>
      <form onSubmit={login}>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password admin" autoFocus />
        {error && <p className="error">{error}</p>}
        <button className="btn full">Masuk</button>
      </form>
    </div>
  );
}
