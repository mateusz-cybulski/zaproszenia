import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Class order and wrapping are left to prettier-plugin-tailwindcss.
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
