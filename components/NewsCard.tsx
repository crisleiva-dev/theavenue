"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/news";

const FALLBACK: NewsItem[] = [
  {
    title: "Lift Repair Works",
    content:
      "Residents are advised that the lift is out of service for safety reasons while the Owners Corporation awaits a report from Kone (Fuji). Please use the stairwell.",
  },
  { title: "Next Hard Rubbish Collection Day", content: "TBC" },
  {
    title: "Horizon Contact",
    content:
      "Horizon Strata Management Group\n03 9687 7788\ninfo@horizonstrata.com.au",
  },
];

const POLL_MS = 60_000;
const ROTATE_MS = 7_000;
const TRANSITION_MS = 600;

export default function NewsCard() {
  const [items, setItems] = useState<NewsItem[]>(FALLBACK);
  const [offset, setOffset] = useState(0);

  // Poll the API.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch("/api/news", { cache: "no-store" });
        if (!r.ok) return;
        const data: NewsItem[] = await r.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      } catch {
        /* keep fallback */
      }
    }
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Carousel: shift by 1 every ROTATE_MS when there are >3 items.
  useEffect(() => {
    if (items.length <= 3) return;
    const id = setInterval(() => {
      setOffset((o) => (o + 1) % items.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [items.length]);

  const visible: NewsItem[] =
    items.length <= 3
      ? items
      : [0, 1, 2].map((i) => items[(offset + i) % items.length]);

  return (
    <div className="bg-surface border border-line rounded-card p-[28px_32px] flex flex-col gap-4 min-h-0 overflow-hidden">
      <div className="text-[0.85rem] uppercase tracking-[0.12em] text-muted shrink-0">
        News Feed
      </div>
      <div className="grid grid-cols-3 gap-[10px] flex-1 min-h-0">
        {visible.map((item, i) => (
          <Tile
            key={`${offset}-${i}`}
            item={item}
            transitionMs={TRANSITION_MS}
          />
        ))}
      </div>
    </div>
  );
}

function Tile({
  item,
  transitionMs,
}: {
  item: NewsItem;
  transitionMs: number;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className="bg-tile rounded-[14px] p-[18px_22px] flex flex-col gap-3 overflow-hidden"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateX(0)" : "translateX(24px)",
        transition: `opacity ${transitionMs}ms ease, transform ${transitionMs}ms ease`,
      }}
    >
      <div className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-teal line-clamp-1">
        {item.title}
      </div>
      <div className="text-[0.95rem] text-ice leading-[1.5] overflow-hidden whitespace-pre-line line-clamp-5">
        {item.content}
      </div>
    </div>
  );
}
