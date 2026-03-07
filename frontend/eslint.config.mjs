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
  ]),
  // Allow inline style= props — needed for dynamic dark-theme gradients
  // (radial-gradient, rgba, backdropFilter etc.) that can't be Tailwind classes.
  {
    rules: {
      "react/forbid-component-props": "off",
      "react/forbid-dom-props": "off",
    },
  },
]);

export default eslintConfig;
