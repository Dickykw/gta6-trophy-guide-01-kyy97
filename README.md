[![GTA 6 Trophy Guide — make.fun bounty](https://img.shields.io/badge/make.fun-gta6--trophy--guide--01-ff5ea8)](https://make.fun/bounty/gta6-trophy-guide-01)
[![55 trophies — 1 platinum, 2 gold, 6 silver, 46 bronze](https://img.shields.io/badge/trophies-55-39d5e8)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Offline — no network needed](https://img.shields.io/badge/offline-yes-5ee6a8)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA 6 (PS5)

An offline guide and tracker for all **55 official PlayStation 5 trophies** of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, 0 online. Built for the [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) bounty on make.fun.

## What it is

- **Tracker** — a checklist of all 55 trophies with their official name, description and grade. Progress saves in the browser (localStorage) and can be exported to a file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade, and by search text. There are no online trophies; the Online filter says so.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Guide** — every trophy has a guide written in our own words for this entry, citing its sources by name and link. A specific location or step is only as good as its source, so each guide names where its facts come from.
- **Roadmap to the platinum** — 4 stages (story → 100% completion → Strangers & Freaks and cleanup → platinum), built from the official descriptions, with collectible counts and the missable flags.
- **Missable warning** — only one trophy is possibly missable: **Positive Mental Attitude** (the Chapter 1 balcony meditation at Jason's house, after *Down to Earth*). Everything else can be done after the story in free-roam.

## Sources

Names, descriptions and grades are as PlayStation publishes them, as listed by Exophase and PSNProfiles (the two agree on all 55). The how-to detail is drawn from PowerPyx, GTABase, Push Square, KeenGamer, EGamers, GTA Scoop and GuideDistrict, rewritten in our own words and cited beside each guide. Two trophies were still unconfirmed in the sources on 20 November 2026 — *Bad Luck, I Guess* and the exact animal for *Fair Game* — and their guides say so honestly instead of inventing a step.

## Run it

Static files, no build step, no network at run time:

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` directly from any static file server with `app/` at its root.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `buildDossier` library. It refuses to run unless all 55 trophies carry a guide and there are 3 or 4 screenshots.

## License

MIT — see [LICENSE](LICENSE).
