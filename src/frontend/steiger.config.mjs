import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // `_app` and `_pages` are renamed so Next.js does not treat them as router folders.
    files: ["./src/_app/**", "./src/_pages/**"],
    rules: { "fsd/typo-in-layer-name": "off" },
  },
  {
    // The event page will use both entities; drop each entry once a second slice imports it.
    files: ["./src/entities/guest/**", "./src/entities/event/**"],
    rules: { "fsd/insignificant-slice": "off" },
  },
]);
