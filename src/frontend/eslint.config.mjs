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
  {
    // Deprecated APIs are flagged in the editor only; this makes them fail the lint.
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: { "@typescript-eslint/no-deprecated": "error" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
