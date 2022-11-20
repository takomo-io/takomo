import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { createDeploymentTargetsConfigSchema } from "../../src/takomo-deployment-targets-config/schema"
import { parseYaml } from "../../src/utils/yaml"
import { expectNoValidationError } from "../assertions"

const schema = createDeploymentTargetsConfigSchema({ regions: ["eu-west-1"] })

const validFilesDir = `${process.cwd()}/test/takomo-deployment-targets-config/deployment-targets-config-schema/valid`
const readFile = (file: string) =>
  parseYaml(file, readFileSync(join(validFilesDir, file)).toString("utf-8"))

const validCases = readdirSync(validFilesDir)

describe("Validation succeeds", () => {
  test.each(validCases)("when %s is given", (file) =>
    expectNoValidationError(schema)(readFile(file)),
  )
})
