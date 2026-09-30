---
name: scrape-2gis-narxoz
description: Collects 2GIS reviews of Narxoz University branches with the TypeScript plugin (no browser, no Python). Use when the user asks for 2GIS / 2ГИС reviews or ratings of нархоз or narxoz, a daily Narxoz review monitoring run, or to summarize collected 2GIS reviews.
---

# Scrape 2GIS reviews for Narxoz

Use this plugin's MCP tools. Do **not** call Python, do **not** open a browser and do
**not** write a second scraper.

## Tools

- `scrape_narxoz_2gis` — collect reviews (`full: true` backfills the archive instead of only the last week)
- `latest_narxoz_2gis` — read saved reviews (`hours: 168` for a week, `24` for a day, `0` for everything; `max_rating: 3` for complaints only)
- `find_narxoz_2gis_branches` — search 2GIS and list the branches that will be scraped
- `narxoz_2gis_status` — data root, tracked branches, last run
- `narxoz_2gis_data_path` — path to `reviews.jsonl`

## Setup

Nothing to install and no credentials: the plugin reads 2GIS search pages and the public
reviews API over plain HTTP. Node 18+ is the only requirement.

Which branches are tracked is decided by `config.json` in the data root reported by
`narxoz_2gis_status` (`~/.narxoz-2gis/config.json` for a standalone install):

- `queries` — what is typed into 2GIS search; `city` / `domain` — where
- `name_filters` — a found branch is kept when its name contains one of these; branches of
  the same organisation come along even under another name
- `branches` / `exclude_branches` — branch ids or firm URLs to force in or out

To keep data somewhere else, set `NARXOZ_2GIS_ROOT` before starting Claude.

## Workflow

1. `scrape_narxoz_2gis`
2. `latest_narxoz_2gis` with `hours: 168`, and again with `hours: 24` if there is a week's worth

## Reporting

Open with rating and review count per branch. Prefer the last 7 days, and call out the
last 24 hours separately when there is anything. Group by branch; give author, date, stars,
link, and a one-line gist per review, followed by its number of replies (`replies_count`)
and the replies themselves (`replies`, oldest first; `from_org` marks Narxoz's own).
Lead with reviews of 3 stars or fewer and name recurring complaints.
