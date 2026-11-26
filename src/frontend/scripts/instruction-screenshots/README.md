# User guide screenshots

The pictures on `/instruction` and `/instruction/pl` live in `src/_pages/instruction/screenshots`. Retake them when the screens they show change:

```sh
src/frontend/scripts/instruction-screenshots/run.sh
```

It needs Docker, the installed Google Chrome (Playwright drives it, nothing is downloaded) and `gcloud auth application-default login` for the AI check. Stop the dev stack first: the script uses the same ports.

What it does:

1. Starts the API in its own Compose project, `zaproszenia-screenshots`, with an empty database, so your local data stays untouched. The project and its volumes are removed at the end.
2. `seed.mjs` adds the sample data: the sender, more guests, three events (one in the past), copies of the system templates, invitation statuses and verifications. AI checks run until one guest needs a review. The AI does not always answer the same way, so run the script again if none does.
3. `shoot-app.mjs` takes the signed-in screens through `next dev`, where the API signs every request in as `DEV_AUTH_USER`.
4. `shoot-sign-in.mjs` takes the sign-in screens. The frontend then runs with a placeholder Firebase key against `mock-api.mjs`, which answers 401 to every request.

The screenshots are WebP at 1.5× of a 1440×900 window: whole pages for lists, and the dialog or the region around an open menu for the rest. `SCREENSHOT_SCALE` in `config/screenshots.ts` must match the scale in `lib.mjs`.

A screen that was added or renamed needs a step in `shoot-app.mjs`, an entry in `config/screenshots.ts` and a figure in both `content-english.ts` and `content-polish.ts`.
