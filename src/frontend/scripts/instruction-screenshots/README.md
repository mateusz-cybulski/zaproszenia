# User guide screenshots

The user guide at `/instruction` (English) and `/instruction/pl` (Polish) shows 20 screenshots of the app. They live in `src/_pages/instruction/screenshots` and are committed with the code. This folder holds the script that retakes all of them from scratch.

Retake them in the branch that changes a screen they show: a new button, a renamed label, a moved field. A change the user does not see leaves them alone.

## Before you run it

| Needs                                   | Why                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| Docker running                          | The API and its database run in containers.                                      |
| Google Chrome installed                 | Playwright drives it; no browser is downloaded.                                  |
| `gcloud auth application-default login` | The sample guests are checked by the real AI (Gemini on Vertex AI).              |
| `npm ci` done in `src/frontend`         | For `next` and `playwright-core`.                                                |
| Ports 3000, 5432, 8000 and 8099 free    | Stop the dev stack (`docker compose stop`); the script stops if a port is taken. |

## Run

From `src/frontend`:

```sh
npm run screenshots:instruction
```

It takes a few minutes, longest the first time, when the API image is built. Your local database is not touched: the script runs in its own Compose project, `zaproszenia-screenshots`, which is removed with its volumes at the end, also when a step fails.

Then:

1. Look through the changed pictures (`git status`, open them in the editor). The AI words its suggestions differently each time, so the review screenshots change a little on every run. Restore the ones you did not mean to change with `git checkout -- <file>`.
2. Open `/instruction` and `/instruction/pl` in the dev stack and read the text next to the pictures that changed.
3. Commit the screenshots together with the UI change they show.

## What the script does

| Step                                                                                                                                                                                                                                                                                                      | File                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Checks the ports, starts the API with an empty database.                                                                                                                                                                                                                                                  | `run.sh`                            |
| Adds the sample data: the sender "Fundacja Kultury Polskiej", 10 guests, three events (the gala, a vernissage and a past concert), copies of the system templates, invitation statuses and verifications. AI checks run guest by guest until one needs a review, because the review screenshots need one. | `seed.mjs`                          |
| Starts `next dev` against the API, which signs every request in as `DEV_AUTH_USER`, and takes the signed-in screens. The sidebar shows a realistic address instead of `dev@localhost`.                                                                                                                    | `shoot-app.mjs`                     |
| Restarts `next dev` with a placeholder Firebase key against a mock API that answers 401 to everything, and takes the sign-in screens.                                                                                                                                                                     | `shoot-sign-in.mjs`, `mock-api.mjs` |
| Stops everything, removes the Compose project and the `AGENTS.md` that `next dev` writes.                                                                                                                                                                                                                 | `run.sh`                            |

`guests.csv` is the file the import screenshot checks: three new guests, one already in the base and one row with errors.

Every screenshot is WebP at 1.5× of a 1440×900 window. Lists are whole pages; dialogs are cropped to the dialog and menus to the area around them, so the text stays readable at the guide's width. `SCREENSHOT_SCALE` in `src/_pages/instruction/config/screenshots.ts` must stay equal to the scale in `lib.mjs`.

## When it fails

The output names the step, and the line `Logs: …` at the end points to the logs of Compose and `next dev`.

| Message                                                           | What to do                                                                                              |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `Port … is in use`                                                | Stop the dev stack or whatever listens there.                                                           |
| `No AI check needs a review`                                      | Check the gcloud login. If it is fine, the AI found nothing to correct this time: run the script again. |
| `… did not answer`                                                | Read `compose.log` or `frontend.log` in the logs folder; the API image may have failed to build.        |
| A locator timeout in `shoot-app.mjs`                              | A label or a button the script clicks has changed. Update the step to match the new UI.                 |
| `browserType.launch: Chromium distribution 'chrome' is not found` | Install Google Chrome.                                                                                  |

## Adding or renaming a screenshot

1. Add a step to `shoot-app.mjs` (or `shoot-sign-in.mjs`) that opens the screen and calls `capture("<name>", …)`. Pass the dialog to crop to it, a rectangle for part of a page, or nothing for the whole window.
2. Import the file in `src/_pages/instruction/config/screenshots.ts` and add it to `SCREENSHOTS`.
3. Add a `figure` block with an `alt` text and a caption to both `content-english.ts` and `content-polish.ts`.
4. Run the script and check the result as above.

To remove a screenshot, do the same in reverse and delete its file.
