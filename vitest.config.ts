import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // `server-only` throws on import, which breaks testing server-only
      // modules (e.g. barcode/node-decoder) in the node test environment.
      // Replace it with a harmless stub.
      "server-only": path.resolve(
        __dirname,
        "./src/__tests__/__fixtures__/server-only.ts",
      ),
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});
