import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["**/*.{jsx,tsx}"],
    rules: jsxA11y.flatConfigs.recommended.rules
  },
  {
    ignores: [
      ".next/**",
      ".npm-cache/**",
      ".sanity/**",
      "dist/**",
      "New Website 2026/**",
      "next-env.d.ts",
      "node_modules/**"
    ]
  }
];

export default eslintConfig;
