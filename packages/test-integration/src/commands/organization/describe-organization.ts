import { initDefaultCredentialManager } from "@takomo/aws-clients"
import {
  describeOrganizationCommand,
  DescribeOrganizationOutput,
} from "@takomo/organization-commands"
import { createConsoleLogger, createTimer } from "@takomo/util"
import { createTestDescribeOrganizationIO } from "../../io"
import { ExecuteCommandProps } from "../common"
import { createCtxAndConfigRepository } from "./common"

export interface DescribeOrganizationOutputMatcher {
  expectCommandToSucceed: () => DescribeOrganizationOutputMatcher
  assert: () => Promise<DescribeOrganizationOutput>
}

export const createDescribeOrganizationOutputMatcher = (
  executor: () => Promise<DescribeOrganizationOutput>,
  outputAssertions?: (output: DescribeOrganizationOutput) => void,
): DescribeOrganizationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createDescribeOrganizationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<DescribeOrganizationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    return output
  }

  return {
    expectCommandToSucceed,
    assert,
  }
}

export const executeDescribeOrganizationCommand = (
  props: ExecuteCommandProps,
): DescribeOrganizationOutputMatcher =>
  createDescribeOrganizationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      feature: props.feature ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return describeOrganizationCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestDescribeOrganizationIO(logger),
      input: {
        timer: createTimer("total"),
        outputFormat: "text",
      },
    })
  })
