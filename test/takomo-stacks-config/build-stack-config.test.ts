import { AwsClientProvider } from "@takomo/aws-clients"
import { CommandContext, TakomoProjectConfig } from "@takomo/core"
import { mock } from "jest-mock-extended"
import { buildStackConfig } from "../src"

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
  awsClientProvider: mock<AwsClientProvider>(),
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
