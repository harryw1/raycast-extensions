import { defineConfig } from "eslint/config";
import raycast from "@raycast/eslint-config";

export default defineConfig([
  ...raycast,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
