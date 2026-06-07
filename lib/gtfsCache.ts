import fs from "node:fs";
import path from "node:path";

// Static GTFS schedule cache built by scripts/build-gtfs-cache.ts.
// Mirrors the JSON produced by the original build_gtfs_cache.py.

export interface BalaclavaDeparture {
  time: string; // HH:mm (city-bound departure from Balaclava)
  tripId: string;
  headsign: string;
  serviceId: string;
}

export interface GtfsCache {
  trip_headsigns: Record<string, string>;
  stop_names: Record<string, string>;
  balaclava_departures: BalaclavaDeparture[];
  active_dates: Record<string, string[]>; // serviceId -> ["YYYY-MM-DD", ...]
  built_for_date?: string;
}

let _cache: GtfsCache | null = null;

export function getGtfsCache(): GtfsCache {
  if (!_cache) {
    const p = path.join(process.cwd(), "data", "gtfs_cache.json");
    _cache = JSON.parse(fs.readFileSync(p, "utf8")) as GtfsCache;
  }
  return _cache;
}
