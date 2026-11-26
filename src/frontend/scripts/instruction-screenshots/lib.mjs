// Shared by the screenshot scripts: addresses, the browser and the capture of one screenshot.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright-core";

export const APP_URL = "http://localhost:3000";
export const API_URL = "http://localhost:8000";
export const SCREENSHOT_DIR = fileURLToPath(
  new URL("../../src/_pages/instruction/screenshots/", import.meta.url),
);

const VIEWPORT = { width: 1440, height: 900 };
// The same as SCREENSHOT_SCALE in the instruction page's config.
const SCALE = 1.5;
const DIALOG_PADDING = 16;
const SHOWN_EMAIL = "biuro@fundacja-kultury.pl";
const PAGE_STYLE = `
  nextjs-portal { display: none !important; }
  * { caret-color: transparent !important; }
`;

export async function api(method, path, body) {
  const response = await fetch(API_URL + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}: ${await response.text()}`);
  }
  return response.status === 204 ? null : response.json();
}

// The installed Chrome, so nothing is downloaded.
export async function openBrowser() {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    colorScheme: "light",
    locale: "pl-PL",
    timezoneId: "Europe/Warsaw",
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  async function settle() {
    await page.waitForLoadState("networkidle");
    await page
      .waitForFunction(() =>
        [...document.images].every((image) => image.complete && image.naturalWidth > 0),
      )
      .catch(() => {});
    await page.waitForTimeout(600);
  }

  // Hides the dev tools button and shows a realistic address instead of the dev account's.
  async function open(path) {
    await page.goto(APP_URL + path, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: PAGE_STYLE });
    await page.evaluate((email) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeValue?.includes("dev@localhost")) {
          node.nodeValue = node.nodeValue.replace("dev@localhost", email);
        }
      }
    }, SHOWN_EMAIL);
    await settle();
  }

  // A target is a locator (taken with a margin) or a rectangle in CSS pixels; none is the viewport.
  async function capture(name, target, maxHeight = VIEWPORT.height) {
    let clip;
    if (target) {
      const isLocator = typeof target.boundingBox === "function";
      const box = isLocator ? await target.boundingBox() : target;
      const padding = isLocator ? DIALOG_PADDING : 0;
      const x = Math.max(0, box.x - padding);
      const y = Math.max(0, box.y - padding);
      clip = {
        x,
        y,
        width: Math.min(VIEWPORT.width - x, box.width + padding * 2),
        height: Math.min(VIEWPORT.height - y, maxHeight, box.height + padding * 2),
        scale: 1,
      };
    }
    const { data } = await cdp.send("Page.captureScreenshot", {
      format: "webp",
      quality: 88,
      ...(clip ? { clip } : {}),
    });
    writeFileSync(join(SCREENSHOT_DIR, `${name}.webp`), Buffer.from(data, "base64"));
    console.log(`saved ${name}.webp`);
  }

  return { browser, page, open, settle, capture };
}
