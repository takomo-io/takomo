import { initDefaultCredentialManager } from "@takomo/aws-clients"
import { AccountId } from "@takomo/aws-model"
import {
  CreateAccountAliasOutput,
  deleteAccountAliasCommand,
  DeleteAccountAliasOutput,
} from "@takomo/organization-commands"
import { createConsoleLogger, createTimer } from "@takomo/util"
import { createTestDeleteAccountAliasIO } from "../../io"
import { ExecuteCommandProps } from "../common"
import { createCtxAndConfigRepository } from "./common"

export interface DeleteAccountAliasOutputMatcher {
  expectCommandToSucceed: () => DeleteAccountAliasOutputMatcher
  assert: () => Promise<DeleteAccountAliasOutput>
}

export const createDeleteAccountAliasOutputMatcher = (
  executor: () => Promise<DeleteAccountAliasOutput>,
  outputAssertions?: (output: DeleteAccountAliasOutput) => void,
): DeleteAccountAliasOutputMatcher => {
  const expectCommandToSucceed = () =>
    createDeleteAccountAliasOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<CreateAccountAliasOutput> => {
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

export interface ExecuteDeleteAccountAliasCommand extends ExecuteCommandProps {
  readonly accountId: AccountId
}

export const executeDeleteAccountAliasCommand = (
  props: ExecuteDeleteAccountAliasCommand,
): DeleteAccountAliasOutputMatcher =>
  createDeleteAccountAliasOutputMatcher(async () => {
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

    return deleteAccountAliasCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestDeleteAccountAliasIO(logger),
      input: {
        accountId: props.accountId,
        timer: createTimer("total"),
        outputFormat: "text",
      },
    })
  })
