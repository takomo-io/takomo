import { FilePath } from "../../src/takomo-util"
import { join } from "path"

export const pathToConfigs = (...paths: FilePath[]): string =>
  join(process.cwd(), "integration-test", "configs", ...paths)
