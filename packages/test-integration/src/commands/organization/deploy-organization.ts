import { initDefaultCredentialManager } from "@takomo/aws-clients"
import {
  deployOrganizationCommand,
  DeployOrganizationOutput,
} from "@takomo/organization-commands"
import { createConsoleLogger, createTimer } from "@takomo/util"
import { createTestDeployOrganizationIO } from "../../io"
import { ExecuteCommandProps } from "../common"
import { createCtxAndConfigRepository } from "./common"

export interface DeployOrganizationOutputMatcher {
  expectCommandToSucceed: () => DeployOrganizationOutputMatcher
  expectCommandToFail: (
    message: string,
    errorMessage?: string,
  ) => DeployOrganizationOutputMatcher
  expectCommandToThrow: (error: any) => Promise<void>
  expectCommandToThrowWithMessage: (message: string) => Promise<void>
  assert: () => Promise<DeployOrganizationOutput>
}

export const createDeployOrganizationOutputMatcher = (
  executor: () => Promise<DeployOrganizationOutput>,
  outputAssertions?: (output: DeployOrganizationOutput) => void,
): DeployOrganizationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createDeployOrganizationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToThrow = async (error: any): Promise<void> => {
    await expect(executor).rejects.toEqual(error)
  }

  const expectCommandToThrowWithMessage = async (
    message: string,
  ): Promise<void> => {
    await expect(executor).rejects.toThrow(message)
  }

  const expectCommandToFail = (message: string, errorMessage?: string) =>
    createDeployOrganizationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("FAILED")
      expect(output.message).toEqual(message)
      expect(output.success).toEqual(false)

      if (errorMessage) {
        expect(output.error?.message).toStrictEqual(errorMessage)
      } else {
        expect(output.error).toBeUndefined()
      }
    })

  const assert = async (): Promise<DeployOrganizationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    return output
  }

  return {
    expectCommandToSucceed,
    expectCommandToFail,
    expectCommandToThrow,
    expectCommandToThrowWithMessage,
    assert,
  }
}

export const executeDeployOrganizationCommand = (
  props: ExecuteCommandProps,
): DeployOrganizationOutputMatcher =>
  createDeployOrganizationOutputMatcher(async () => {
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

    return deployOrganizationCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestDeployOrganizationIO(logger),
      input: {
        timer: createTimer("total"),
        outputFormat: "text",
      },
    })
  })
