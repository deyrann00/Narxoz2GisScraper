---
description: Check the Narxoz 2GIS plugin install and list the branches it will scrape
---

Get this machine ready to scrape. There is nothing to install and no login.

1. Call `narxoz_2gis_status`.
2. Report `data_root` — that is where reviews, config and run logs are stored.
3. Call `find_narxoz_2gis_branches` and list what it found: name, address, rating, review count.
4. Tell the user how to change the list by editing `config_file`: add a branch id or a
   2GIS firm URL to `branches` to always track it, to `exclude_branches` to drop it, or
   change `queries` / `name_filters` / `city` to track a different organisation.
5. If the archive is empty, mention that `scrape_narxoz_2gis` with `full: true` backfills
   older reviews (up to `max_reviews_per_branch` per branch).
6. Finish by saying they can now run `/narxoz-2gis:scrape`.

$ARGUMENTS
