import { AwsClientProvider } from "@takomo/aws-clients"
import { CommandContext, TakomoProjectConfig } from "@takomo/core"
import { mock } from "jest-mock-extended"
import { buildStackConfig } from "../src"

const emptyStackConfig = {
  accountIds: undefined,
  commandRole: undefined,
  data: {},
  depends: [],
  hooks: [],
  name: undefined,
  parameters: new Map(),
  project: undefined,
  regions: [],
  tags: new Map(),
  template: { dynamic: true },
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
  iamGeneratePoliciesInstructionsEnabled: false,
  credentials: undefined,
  projectConfig: mock<TakomoProjectConfig>(),
  awsClientProvider: mock<AwsClientProvider>(),
}

describe("#buildStackConfig", () => {
  test("empty config object", () => {
    expect(buildStackConfig(ctx, {})._unsafeUnwrap()).toStrictEqual(
      emptyStackConfig,
    )
  })
})
