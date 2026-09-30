import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scraperRoot } from "../repo.js";

export type AppConfig = {
  /** Search phrases typed into 2GIS to find the organisation's branches. */
  queries: string[];
  /** A found branch is kept when its name contains one of these (any case). */
  name_filters: string[];
  /** Branch ids or 2GIS firm URLs that are always tracked. */
  branches: string[];
  /** Branch ids or 2GIS firm URLs that are never tracked. */
  exclude_branches: string[];
  city: string;
  domain: string;
  locale: string;
  timezone: string;
  lookback_hours: number;
  week_hours: number;
  max_reviews_per_branch: number;
  /** Overrides the public key that 2GIS embeds in its own pages. */
  review_api_key: string;
};

const DEFAULTS: AppConfig = {
  queries: ["Нархоз", "Narxoz"],
  name_filters: ["нархоз", "narxoz"],
  branches: [],
  exclude_branches: [],
  city: "almaty",
  domain: "2gis.kz",
  locale: "ru_KZ",
  timezone: "Asia/Almaty",
  lookback_hours: 24,
  week_hours: 168,
  max_reviews_per_branch: 500,
  review_api_key: "",
};

export function paths(root = scraperRoot()) {
  const data = join(root, "data");
  mkdirSync(data, { recursive: true });
  mkdirSync(join(data, "runs"), { recursive: true });
  return {
    root,
    data,
    config: join(root, "config.json"),
    reviewsJsonl: join(data, "reviews.jsonl"),
    reviewsCsv: join(data, "reviews.csv"),
    branches: join(data, "branches.json"),
    runs: join(data, "runs"),
  };
}

export function loadConfig(root = scraperRoot()): AppConfig {
  const cfg = { ...DEFAULTS };
  const file = paths(root).config;
  if (existsSync(file)) {
    Object.assign(cfg, JSON.parse(readFileSync(file, "utf8")) as Partial<AppConfig>);
  } else {
    // First run of a standalone install: leave an editable copy of the defaults.
    writeFileSync(file, JSON.stringify(DEFAULTS, null, 2) + "\n", "utf8");
  }
  return cfg;
}
