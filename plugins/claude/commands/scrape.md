---
description: Collect new 2GIS reviews of Narxoz branches and summarise the last 7 days
---

Collect fresh 2GIS reviews of Narxoz University.

1. Call `scrape_narxoz_2gis`.
2. Call `latest_narxoz_2gis` with `hours: 168`, then again with `hours: 24` if the weekly set is non-empty.

Start with one line per branch from the scrape summary: name, address, rating, total
review count. Then report the last 7 days grouped by branch, and call out anything from
the last 24 hours. For each review give the author, the date, the stars, the link, and a
one-line gist, then the number of replies (`replies_count`) and the replies themselves
(`replies`, oldest first; `from_org` marks Narxoz's own). Put reviews with 3 stars or
fewer first and name the recurring complaints.

If the week is empty, say so and offer `/narxoz-2gis:report` for the saved archive.

$ARGUMENTS
