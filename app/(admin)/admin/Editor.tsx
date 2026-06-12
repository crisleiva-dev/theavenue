"use client";

import { useState } from "react";
import {
  MAX_ITEMS,
  MAX_TITLE,
  MAX_CONTENT,
  type NewsItem,
} from "@/lib/news";

type Slot = { title: string; content: string };

function toSlots(items: NewsItem[]): Slot[] {
  const slots: Slot[] = Array.from({ length: MAX_ITEMS }, () => ({
    title: "",
    content: "",
  }));
  items.slice(0, MAX_ITEMS).forEach((it, i) => {
    slots[i] = { title: it.title, content: it.content };
  });
  return slots;
}

function rowError(s: Slot): string | null {
  const t = s.title.trim();
  const c = s.content.trim();
  if (!t && !c) return null;
  if (!t) return "Title required";
  if (!c) return "Content required";
  if (t.length > MAX_TITLE) return `Title over ${MAX_TITLE}`;
  if (c.length > MAX_CONTENT) return `Content over ${MAX_CONTENT}`;
  return null;
}

export default function Editor({ initialItems }: { initialItems: NewsItem[] }) {
  const [slots, setSlots] = useState<Slot[]>(toSlots(initialItems));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );

  const errors = slots.map(rowError);
  const hasErrors = errors.some((e) => e !== null);

  function update(i: number, patch: Partial<Slot>) {
    setSlots((s) => s.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
    setMsg(null);
  }

  function clear(i: number) {
    update(i, { title: "", content: "" });
  }

  async function save() {
    if (hasErrors) return;
    setBusy(true);
    setMsg(null);
    const items = slots
      .map((s) => ({ title: s.title.trim(), content: s.content.trim() }))
      .filter((s) => s.title || s.content);
    try {
      const r = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setMsg({ kind: "err", text: d.error ?? "Save failed" });
        return;
      }
      setMsg({ kind: "ok", text: "Saved." });
    } catch {
      setMsg({ kind: "err", text: "Network error" });
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">News Feed</h1>
          <p className="text-sm text-muted">
            Up to {MAX_ITEMS} items. First 3 show static; 4–6 rotate as a
            carousel on the TV.
          </p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-muted hover:text-ink"
        >
          Sign out
        </button>
      </header>

      <div className="flex flex-col gap-4">
        {slots.map((s, i) => {
          const err = errors[i];
          const tOver = s.title.length > MAX_TITLE;
          const cOver = s.content.length > MAX_CONTENT;
          return (
            <div
              key={i}
              className="bg-surface border border-line rounded-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-muted">
                  Slot {i + 1}
                </div>
                <button
                  type="button"
                  onClick={() => clear(i)}
                  className="text-xs text-muted hover:text-red"
                >
                  Clear
                </button>
              </div>
              <label className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Title"
                  value={s.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  className="bg-tile border border-line rounded-md px-3 py-2 text-ink outline-none focus:border-teal"
                />
                <span
                  className={`text-xs self-end ${tOver ? "text-red" : "text-muted"}`}
                >
                  {s.title.length} / {MAX_TITLE}
                </span>
              </label>
              <label className="flex flex-col gap-1">
                <textarea
                  placeholder="Content (line breaks preserved)"
                  rows={4}
                  value={s.content}
                  onChange={(e) => update(i, { content: e.target.value })}
                  className="bg-tile border border-line rounded-md px-3 py-2 text-ink outline-none focus:border-teal resize-y"
                />
                <span
                  className={`text-xs self-end ${cOver ? "text-red" : "text-muted"}`}
                >
                  {s.content.length} / {MAX_CONTENT}
                </span>
              </label>
              {err && <div className="text-red text-xs">{err}</div>}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 sticky bottom-0 bg-bg/90 backdrop-blur py-3">
        <button
          onClick={save}
          disabled={busy || hasErrors}
          className="bg-teal text-bg font-semibold rounded-md px-5 py-2 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        {msg && (
          <span
            className={`text-sm ${msg.kind === "ok" ? "text-green" : "text-red"}`}
          >
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
