import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Correctness only (unknown, conflicting, concatenated, duplicate, deprecated classes).
    // Class order and wrapping are Prettier's job (prettier-plugin-tailwindcss).
    files: ["**/*.{ts,tsx}"],
    ...betterTailwindcss.configs["correctness-error"],
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/_app/styles/globals.css",
        callees: ["cn", "clsx", "cva"],
      },
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
