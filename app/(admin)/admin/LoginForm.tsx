"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(d.error ?? "Login failed");
        return;
      }
      window.location.reload();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-surface border border-line rounded-card p-8 w-full max-w-sm flex flex-col gap-4"
    >
      <h1 className="text-xl font-semibold text-ink">Admin Sign In</h1>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Email
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-tile border border-line rounded-md px-3 py-2 text-ink outline-none focus:border-teal"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-tile border border-line rounded-md px-3 py-2 text-ink outline-none focus:border-teal"
        />
      </label>
      {error && <div className="text-red text-sm">{error}</div>}
      <button
        type="submit"
        disabled={busy}
        className="bg-teal text-bg font-semibold rounded-md py-2 disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
