import { expectNoValidationError } from "@takomo/test-unit"
import { parseYaml } from "@takomo/util"
import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { createDeploymentTargetsConfigSchema } from "../src/schema"

const schema = createDeploymentTargetsConfigSchema({ regions: ["eu-west-1"] })

const validFilesDir = `${process.cwd()}/test/deployment-targets-config-schema/valid`
const readFile = (file: string) =>
  parseYaml(file, readFileSync(join(validFilesDir, file)).toString("utf-8"))

const validCases = readdirSync(validFilesDir)

describe("Validation succeeds", () => {
  test.each(validCases)("when %s is given", (file) =>
    expectNoValidationError(schema)(readFile(file)),
  )
})
