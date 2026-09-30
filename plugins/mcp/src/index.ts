import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot, reviewsPath, scraperRoot } from "./repo.js";
import { recentReviews } from "./reviews.js";
import { discoverBranches } from "./scraper/branches.js";
import { loadConfig, paths } from "./scraper/config.js";
import { scrapeOnce } from "./scraper/run.js";
import { loadBranches, saveBranches } from "./scraper/store.js";

const server = new McpServer({
  name: "narxoz-2gis",
  version: "0.2.0",
});

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });
const json = (value: unknown) => text(JSON.stringify(value, null, 2));
const failure = (err: unknown) => ({
  content: [{ type: "text" as const, text: err instanceof Error ? err.message : String(err) }],
  isError: true,
});

function lastRun(runsDir: string): unknown {
  const latest = readdirSync(runsDir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .pop();
  if (!latest) {
    return null;
  }
  try {
    const run = JSON.parse(readFileSync(join(runsDir, latest), "utf8"));
    return { ran_at: run.ran_at, found: run.found, new: run.new, total: run.total, errors: run.errors };
  } catch {
    return null;
  }
}

server.tool(
  "scrape_narxoz_2gis",
  "Collect 2GIS reviews for every Narxoz branch (plain HTTP, no browser, no login).",
  {
    full: z
      .boolean()
      .optional()
      .describe("Backfill the archive: ignore the weekly window and read up to max_reviews_per_branch"),
  },
  async ({ full }) => {
    try {
      return json(await scrapeOnce(scraperRoot(), Boolean(full)));
    } catch (err) {
      return failure(err);
    }
  }
);

server.tool(
  "find_narxoz_2gis_branches",
  "Search 2GIS and list the branches that will be scraped, with their rating and review count.",
  {},
  async () => {
    try {
      const root = scraperRoot();
      const discovery = await discoverBranches(loadConfig(root));
      if (discovery.branches.length) {
        saveBranches(root, discovery.branches);
      }
      return json({ branches: discovery.branches, errors: discovery.errors });
    } catch (err) {
      return failure(err);
    }
  }
);

server.tool(
  "narxoz_2gis_status",
  "Report where the plugin stores data, which branches it tracks, and when it last ran.",
  {},
  async () => {
    try {
      const root = scraperRoot();
      const cfg = loadConfig(root);
      const loc = paths(root);
      return json({
        data_root: root,
        plugin_root: pluginRoot(),
        config_file: loc.config,
        reviews_file: loc.reviewsJsonl,
        branches_file: loc.branches,
        queries: cfg.queries,
        name_filters: cfg.name_filters,
        city: cfg.city,
        domain: cfg.domain,
        tracked_branches: loadBranches(root).map(({ id, name, address, rating, reviews_count }) => ({
          id,
          name,
          address,
          rating,
          reviews_count,
        })),
        reviews_collected: existsSync(loc.reviewsJsonl),
        last_run: lastRun(loc.runs),
      });
    } catch (err) {
      return failure(err);
    }
  }
);

server.tool(
  "latest_narxoz_2gis",
  "Return saved 2GIS reviews, newest first. hours=168 is last 7 days; hours=0 is the full archive.",
  {
    limit: z.number().int().min(1).max(200).optional(),
    hours: z.number().int().min(0).max(87600).optional(),
    max_rating: z.number().int().min(1).max(5).optional().describe("Only reviews with this many stars or fewer"),
  },
  async ({ limit, hours, max_rating }) => {
    try {
      return json(recentReviews(scraperRoot(), hours ?? 168, limit ?? 50, max_rating));
    } catch (err) {
      return failure(err);
    }
  }
);

server.tool(
  "narxoz_2gis_data_path",
  "Return the path to the JSONL archive of collected 2GIS reviews.",
  {},
  async () => text(reviewsPath(scraperRoot()))
);

const transport = new StdioServerTransport();
await server.connect(transport);
