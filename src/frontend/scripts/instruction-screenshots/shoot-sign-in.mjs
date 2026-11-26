// The sign-in screens: the frontend runs with a placeholder Firebase key against mock-api.mjs,
// which answers every request with 401, so no session exists.
import { openBrowser } from "./lib.mjs";

const SCREENS = [
  ["login", "/"],
  ["register", "/register"],
];
const MARGIN = 32;

const { browser, page, open, capture } = await openBrowser();

for (const [name, path] of SCREENS) {
  await open(path);
  const card = await page.locator('[data-slot="card"]').first().boundingBox();
  await capture(name, {
    x: card.x - MARGIN,
    y: card.y - MARGIN,
    width: card.width + MARGIN * 2,
    height: card.height + MARGIN * 2,
  });
}

await browser.close();
