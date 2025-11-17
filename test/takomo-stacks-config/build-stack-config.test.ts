import { mock } from "jest-mock-extended"
import { TakomoProjectConfig } from "../../src/config/project-config.js"
import { CommandContext } from "../../src/context/command-context.js"
import { buildStackConfig } from "../../src/parser/stacks/build-stack-config.js"

const emptyStackConfig = {
  accountIds: undefined,
  commandRole: undefined,
  data: {},
  depends: undefined,
  hooks: [],
  name: undefined,
  parameters: new Map(),
  project: undefined,
  regions: [],
  tags: new Map(),
  template: undefined,
  templateBucket: undefined,
  timeout: undefined,
  capabilities: undefined,
  ignore: undefined,
  obsolete: undefined,
  terminationProtection: undefined,
  stackPolicy: undefined,
  stackPolicyDuringUpdate: undefined,
  schemas: undefined,
  inheritTags: undefined,
  blueprint: undefined,
  type: undefined,
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
  iamGeneratePoliciesInstructionsEnabled: false,
  credentials: undefined,
  projectConfig: mock<TakomoProjectConfig>(),
  quiet: false,
  outputFormat: "text",
  resetCache: false,
}

describe("#buildStackConfig", () => {
  test("empty config object", () => {
    expect(buildStackConfig(ctx, {}, "stack")._unsafeUnwrap()).toStrictEqual(
      emptyStackConfig,
    )
  })
})
