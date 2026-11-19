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
    // Rules that need the types: tsc alone accepts all of these.
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      "@typescript-eslint/no-deprecated": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { considerDefaultExhaustiveForUnions: true },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
