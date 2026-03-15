import { defineConfig } from "vitest/config"

const TEST_DB_URL = "postgresql://postgres:postgres@localhost:5432/taskflow_test"

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./src/test/global-setup.ts"],
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 30_000,
    env: {
      DATABASE_URL: TEST_DB_URL,
    },
  },
})
