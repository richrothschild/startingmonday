import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// In ESLint v9 flat config, plugin-prefixed rules must be resolved within the
// config object that declares them. Collect every plugin already registered by
// eslint-config-next so the override block below can reference them.
const inheritedPlugins = [...nextVitals, ...nextTs].reduce((acc, cfg) => {
  return cfg.plugins ? { ...acc, ...cfg.plugins } : acc
}, {})

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: inheritedPlugins,
    rules: {
      // Temporary baseline stabilization: keep these visible as warnings
      // while we incrementally clean up legacy violations.
      "react/no-unescaped-entities": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "prefer-const": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // One-off local scripts — not application code, not meant to be linted:
    "extract_pdf.js",
    "probe.js",
    "run_extract.js",
  ]),
]);

export default eslintConfig;
