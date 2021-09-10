import { initDefaultCredentialManager } from "@takomo/aws-clients"
import {
  listAccountsCommand,
  ListAccountsOutput,
} from "@takomo/organization-commands"
import { createConsoleLogger, createTimer } from "@takomo/util"
import { createTestListAccountsIO } from "../../io"
import { ExecuteCommandProps } from "../common"
import { createCtxAndConfigRepository } from "./common"

export interface ListAccountsOutputMatcher {
  expectCommandToSucceed: () => ListAccountsOutputMatcher
  assert: () => Promise<ListAccountsOutput>
}

export const createListAccountsOutputMatcher = (
  executor: () => Promise<ListAccountsOutput>,
  outputAssertions?: (output: ListAccountsOutput) => void,
): ListAccountsOutputMatcher => {
  const expectCommandToSucceed = () =>
    createListAccountsOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<ListAccountsOutput> => {
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

export const executeListAccountsCommand = (
  props: ExecuteCommandProps,
): ListAccountsOutputMatcher =>
  createListAccountsOutputMatcher(async () => {
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

    return listAccountsCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestListAccountsIO(logger),
      input: {
        timer: createTimer("total"),
        outputFormat: "text",
      },
    })
  })
