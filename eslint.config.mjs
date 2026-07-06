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
  {
    // Editorial standard: no em-dashes in user-facing source. Enforced here
    // (in-editor, at lint time) instead of a CI grep step so violations are
    // caught while typing rather than at push time.
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXText[value=/\u2014/]",
          message: "Em-dash (\u2014) is not allowed in UI copy. Use a regular hyphen or reword.",
        },
        {
          // A standalone em-dash literal ('\u2014') is allowed as an
          // empty-value placeholder glyph; em-dashes embedded in copy are not.
          selector: "Literal[value=/./][value=/\u2014/]:not([value='\u2014'])",
          message: "Em-dash (\u2014) is not allowed in string copy. Use a regular hyphen or reword.",
        },
        {
          selector: "TemplateElement[value.raw=/\u2014/]",
          message: "Em-dash (\u2014) is not allowed in template copy. Use a regular hyphen or reword.",
        },
      ],
    },
  },
  {
    // Intelligence Scanner: model centralization enforcement (Epic E0 T0.3).
    // No hardcoded model strings in worker/ — must use worker/lib/models.js HAIKU/SONNET.
    // models.js itself is the single allowed definition site.
    files: ["worker/**/*.{js,ts}"],
    ignores: ["worker/lib/models.js"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/claude-(haiku|sonnet)/]",
          message: "Hardcoded model name found. Use HAIKU or SONNET from worker/lib/models.js instead.",
        },
      ],
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
    // Generated Playwright output — not source, contains minified third-party JS:
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
    "dist/**",
    "tmp/**",
    "tmp-run-*-artifacts/**",
  ]),
]);

export default eslintConfig;
