import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { createDeploymentTargetsConfigSchema } from "../../../src/schema/deployment-targets-config-schema.js"
import { parseYaml } from "../../../src/utils/yaml.js"
import { expectNoValidationError } from "../../assertions.js"

const schema = createDeploymentTargetsConfigSchema({ regions: ["eu-west-1"] })

const validFilesDir = `${process.cwd()}/test/schema/deployment-targets-config-schema/files/valid`
const readFile = (file: string) =>
  parseYaml(file, readFileSync(join(validFilesDir, file)).toString("utf-8"))

const validCases = readdirSync(validFilesDir)

describe("Validation succeeds", () => {
  test.each(validCases)("when %s is given", (file) =>
    expectNoValidationError(schema)(readFile(file)),
  )
})
