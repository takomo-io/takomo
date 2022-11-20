import { join } from "path"
import { FilePath } from "../../src/utils/files"

export const pathToConfigs = (...paths: FilePath[]): string =>
  join(process.cwd(), "integration-test", "configs", ...paths)
