import { Options } from "@takomo/core"
import { ConsoleLogger, LogLevel, TemplateEngine } from "@takomo/util"
import { parseStackConfigFile } from "../../src"

const emptyStackConfig = {
  commandRole: null,
  data: {},
  depends: [],
  accountIds: null,
  hooks: [],
  name: null,
  parameters: new Map(),
  project: null,
  regions: [],
  secrets: new Map(),
  tags: new Map(),
  template: null,
  templateBucket: null,
  timeout: null,
  capabilities: null,
  ignore: null,
}

describe("parse stack config file", () => {
  test("returns an empty object when an empty file is given", async () => {
    await expect(
      parseStackConfigFile(
        new ConsoleLogger(),
        new Options({
          logConfidentialInfo: false,
          autoConfirm: false,
          logLevel: LogLevel.DEBUG,
          projectDir: "",
          stats: false,
        }),
        {},
        "./test/parsers/empty.yml",
        new TemplateEngine(),
      ),
    ).resolves.toStrictEqual(emptyStackConfig)
  })
})
