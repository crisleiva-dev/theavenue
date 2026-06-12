import { put, list } from "@vercel/blob";

export const MAX_ITEMS = 6;
export const MAX_TITLE = 40;
export const MAX_CONTENT = 280;
const BLOB_PATH = "news.json";

export interface NewsItem {
  title: string;
  content: string;
}

const DEFAULT_ITEMS: NewsItem[] = [
  {
    title: "Lift Repair Works",
    content:
      "Residents are advised that the lift is out of service for safety reasons while the Owners Corporation awaits a report from Kone (Fuji). Please use the stairwell. We apologise for the inconvenience.",
  },
  { title: "Next Hard Rubbish Collection Day", content: "TBC" },
  {
    title: "Horizon Contact",
    content:
      "Horizon Strata Management Group\n03 9687 7788\ninfo@horizonstrata.com.au",
  },
];

export function validateItems(input: unknown): NewsItem[] {
  if (!Array.isArray(input)) throw new Error("Items must be an array");
  if (input.length > MAX_ITEMS)
    throw new Error(`Max ${MAX_ITEMS} items allowed`);

  const out: NewsItem[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object")
      throw new Error("Each item must be an object");
    const title = String((raw as NewsItem).title ?? "").trim();
    const content = String((raw as NewsItem).content ?? "").trim();
    if (!title && !content) continue;
    if (!title || !content)
      throw new Error("Each item needs both a title and content");
    if (title.length > MAX_TITLE)
      throw new Error(`Title exceeds ${MAX_TITLE} chars: "${title}"`);
    if (content.length > MAX_CONTENT)
      throw new Error(`Content exceeds ${MAX_CONTENT} chars`);
    out.push({ title, content });
  }
  return out;
}

export async function readNews(): Promise<NewsItem[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    const blob = blobs.find((b) => b.pathname === BLOB_PATH);
    if (!blob) return DEFAULT_ITEMS;
    const r = await fetch(blob.url, { cache: "no-store" });
    if (!r.ok) return DEFAULT_ITEMS;
    const data = await r.json();
    return validateItems(data);
  } catch {
    return DEFAULT_ITEMS;
  }
}

export async function writeNews(items: NewsItem[]): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(items), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });
}
