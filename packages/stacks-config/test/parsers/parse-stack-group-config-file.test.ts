import { Options } from "@takomo/core"
import { ConsoleLogger, LogLevel, TemplateEngine } from "@takomo/util"
import { parseStackGroupConfigFile } from "../../src"

const emptyStackGroupConfig = {
  commandRole: null,
  data: {},
  hooks: [],
  project: null,
  regions: [],
  accountIds: null,
  tags: new Map(),
  templateBucket: null,
  timeout: null,
  capabilities: null,
  ignore: null,
}

describe("#parseStackGroupConfigFile", () => {
  test("returns an empty object when an empty file is given", async () => {
    await expect(
      parseStackGroupConfigFile(
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
    ).resolves.toStrictEqual(emptyStackGroupConfig)
  })

  test("returns a correctly creeted object a non-empty file is given", async () => {
    await expect(
      parseStackGroupConfigFile(
        new ConsoleLogger(),
        new Options({
          logConfidentialInfo: false,
          autoConfirm: false,
          logLevel: LogLevel.DEBUG,
          projectDir: "",
          stats: false,
        }),
        {},
        "./test/parsers/stack-group-config-1.yml",
        new TemplateEngine(),
      ),
    ).resolves.toStrictEqual({
      commandRole: null,
      data: {},
      hooks: [],
      project: "example-project",
      regions: ["eu-west-1"],
      accountIds: null,
      tags: new Map([
        ["first", "1"],
        ["second", "b"],
      ]),
      templateBucket: null,
      timeout: {
        update: 10,
        create: 5,
      },
      capabilities: null,
      ignore: null,
    })
  })
})
