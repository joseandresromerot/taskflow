import { execSync } from "child_process"
import path from "path"

const TEST_DB_URL = "postgresql://postgres:postgres@localhost:5432/taskflow_test"

export default async function setup() {
  process.env.DATABASE_URL = TEST_DB_URL

  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, "../.."),
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    stdio: "inherit",
  })
}
