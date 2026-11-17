import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // `_app` and `_pages` are the FSD app/pages layers, renamed so Next.js does not
    // treat them as router folders (see the feature-sliced-design skill).
    files: ["./src/_app/**", "./src/_pages/**"],
    rules: { "fsd/typo-in-layer-name": "off" },
  },
]);
