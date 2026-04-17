import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "page_current_fixed_exact.tsx",
    "page_optionA_current_safe.tsx",
    "page_optionA_exact_simple_current.tsx",
    "updated_page.tsx",
  ]),
]);

export default eslintConfig;
