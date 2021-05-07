import { CommandContext } from "@takomo/core"
import { buildStackGroupConfig } from "../src"

const emptyStackGroupConfig = {
  commandRole: undefined,
  data: {},
  hooks: [],
  project: undefined,
  regions: [],
  accountIds: undefined,
  tags: new Map(),
  templateBucket: undefined,
  timeout: undefined,
  capabilities: undefined,
  ignore: undefined,
  terminationProtection: undefined,
}

const ctx: CommandContext = {
  confidentialValuesLoggingEnabled: false,
  variables: {
    env: {},
    context: {
      projectDir: "/tmp",
    },
    var: {},
  },
  logLevel: "info",
  regions: [],
  autoConfirmEnabled: true,
  projectDir: "/tmp",
  statisticsEnabled: false,
}

describe("#buildStackGroupConfig", () => {
  test("returns an empty object when an empty object is given", () => {
    expect(buildStackGroupConfig(ctx, {})._unsafeUnwrap()).toStrictEqual(
      emptyStackGroupConfig,
    )
  })

  test("returns a correctly created object a non-empty file is given", () => {
    expect(
      buildStackGroupConfig(ctx, {
        project: "example-project",
        regions: "eu-west-1",
        timeout: {
          update: 10,
          create: 5,
        },
        tags: {
          first: 1,
          second: "b",
        },
      })._unsafeUnwrap(),
    ).toStrictEqual({
      commandRole: undefined,
      data: {},
      hooks: [],
      project: "example-project",
      regions: ["eu-west-1"],
      accountIds: undefined,
      tags: new Map([
        ["first", "1"],
        ["second", "b"],
      ]),
      templateBucket: undefined,
      terminationProtection: undefined,
      timeout: {
        update: 10,
        create: 5,
      },
      capabilities: undefined,
      ignore: undefined,
    })
  })
})
