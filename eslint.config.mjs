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
      "**/.next/**",
      "**/node_modules/**",
      "bd-intelligence/.venv/**",
      "bd-intelligence/.pytest_cache/**",
      "bd-intelligence/exports/**",
      "bd-intelligence/logs/**",
      "dist/**",
      "New Website 2026/**",
      "next-env.d.ts",
      "node_modules/**",
      "outreach-recorder/**",
      "recruiter-labs/interview-coordination-agent/frontend/**",
      "recruiter-labs/interview-coordination-agent/backend/.pytest_cache/**",
      "recruiter-labs/interview-coordination-agent/backend/.venv/**",
      "recruiter-labs/interview-coordination-agent/frontend/tsconfig.tsbuildinfo"
    ]
  }
];

export default eslintConfig;
