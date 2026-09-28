import nextVitals from "eslint-config-next/core-web-vitals";
import reactPlugin from "eslint-plugin-react";

const disabledReactRules = Object.fromEntries(
  Object.keys(reactPlugin.rules).map((ruleName) => [`react/${ruleName}`, "off"]),
);

export default [
  ...nextVitals,
  {
    ignores: [
      "lib/api/**",
      ".next/**",
      "node_modules/**",
      "drizzle/**",
      "public/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      ...disabledReactRules,
      "react-hooks/incompatible-library": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];
