---
description: Summarise already-collected Narxoz 2GIS reviews without scraping
---

Read the saved archive only — do not scrape.

Call `latest_narxoz_2gis` (`hours: 168` unless the user asks for another window;
`hours: 0` for the full archive; `max_rating: 3` when they only want complaints) and
summarise the results grouped by branch: author, date, stars, link, one-line gist, then
the number of replies (`replies_count`) and the replies themselves (`replies`, oldest
first; `from_org` marks Narxoz's own). Note the overall sentiment and any
recurring topic. If nothing is saved yet, say so and suggest `/narxoz-2gis:scrape`.

$ARGUMENTS
