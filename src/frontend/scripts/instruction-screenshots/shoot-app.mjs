// The signed-in app: a local API with DEV_AUTH_USER and the sample data from seed.mjs.
import { fileURLToPath } from "node:url";

import { api, openBrowser } from "./lib.mjs";

const GUESTS_FILE = fileURLToPath(new URL("guests.csv", import.meta.url));

const events = (await api("GET", "/events")).items;
const gala = events.find((event) => event.name === "Gala 30-lecia Fundacji");
const templates = await api("GET", "/templates");
const invitation = templates.find((template) => template.name === "Zaproszenie na galę");

const { browser, page, open, settle, capture } = await openBrowser();
// An open menu hides the rest of the page from the accessibility tree, so not getByRole.
const dialog = () => page.locator('[role="dialog"]').last();

await open("/events");
await capture("events", { x: 0, y: 0, width: 1440, height: 380 });

await open("/events/add");
await capture("event-new", dialog());

await open(`/events/${gala.id}`);
await capture("event-details", dialog());
await page.getByRole("button", { name: /Do druku/ }).click();
await page.waitForTimeout(400);
await capture("event-print-menu", dialog(), 340);
await page.keyboard.press("Escape");

await open(`/events/${gala.id}?section=templates`);
await page.waitForTimeout(2500);
await settle();
await capture("event-templates", dialog());

await open(`/events/${gala.id}?section=guests`);
await page.getByRole("button", { name: "Dodaj gości" }).click();
await page.waitForTimeout(1500);
await page.getByRole("checkbox").nth(1).click();
await page.getByRole("checkbox").nth(4).click();
await capture("event-guests-add", dialog());

await open("/guests");
await capture("guests");
await page
  .getByRole("button", { name: /Weryfikacja: Wymaga przejrzenia/ })
  .first()
  .click();
await page.waitForTimeout(400);
const menu = await page.getByRole("menu").boundingBox();
await capture("guest-verification-menu", {
  x: 800,
  y: menu.y - 140,
  width: 640,
  height: menu.height + 170,
});
await page.getByRole("menuitem", { name: /Przejrzyj wynik AI/ }).click();
await page.waitForTimeout(600);
await capture("guest-ai-review", dialog());
await page.keyboard.press("Escape");

await open("/guests");
for (const name of ["dr Ewa Mazur", "Marek Dąbrowski", "Agnieszka Wójcik"]) {
  await page.getByRole("checkbox", { name: `Zaznacz: ${name}` }).click();
}
await page.waitForTimeout(300);
await capture("guests-selection", { x: 240, y: 80, width: 1200, height: 740 });

await open("/guests");
await page.getByRole("button", { name: "Zweryfikuj wszystkich" }).click();
await page.waitForTimeout(500);
await capture("guests-verify", dialog());

await open("/guests");
await page.getByRole("button", { name: "Importuj" }).click();
await page.locator('input[type="file"]').setInputFiles(GUESTS_FILE);
await page.getByRole("button", { name: "Sprawdź plik" }).click();
await page.getByText("Do dodania", { exact: true }).waitFor();
await page.waitForTimeout(500);
await capture("guests-import", dialog());

const annaKowalska = (await api("GET", "/guests?q=Kowalska")).items[0];
await open(`/guests/${annaKowalska.id}`);
await capture("guest-edit", dialog());

await open("/templates");
await capture("templates");
await page.getByRole("button", { name: "Wgraj PDF" }).click();
await page.waitForTimeout(500);
await capture("template-upload", dialog());

await open(`/templates/${invitation.id}`);
await page.waitForTimeout(2500);
await settle();
await capture("template-editor", dialog());
await dialog().getByRole("listitem").first().getByRole("button").click();
await page.waitForTimeout(2000);
await settle();
await capture("template-field", dialog());

await open("/settings");
await capture("settings", { x: 240, y: 0, width: 840, height: 720 });

await browser.close();
