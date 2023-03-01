import { join } from "path"
import { FilePath } from "../../src/utils/files.js"

export const pathToConfigs = (...paths: FilePath[]): string =>
  join(process.cwd(), "integration-test", "configs", ...paths)
