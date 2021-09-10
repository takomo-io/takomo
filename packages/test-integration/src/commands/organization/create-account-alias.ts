import { initDefaultCredentialManager } from "@takomo/aws-clients"
import { AccountAlias, AccountId } from "@takomo/aws-model"
import {
  createAccountAliasCommand,
  CreateAccountAliasOutput,
} from "@takomo/organization-commands"
import { createConsoleLogger, createTimer } from "@takomo/util"
import { createTestCreateAccountAliasIO } from "../../io"
import { ExecuteCommandProps } from "../common"
import { createCtxAndConfigRepository } from "./common"

export interface CreateAccountAliasOutputMatcher {
  expectCommandToSucceed: () => CreateAccountAliasOutputMatcher
  assert: () => Promise<CreateAccountAliasOutput>
}

export const createCreateAccountAliasOutputMatcher = (
  executor: () => Promise<CreateAccountAliasOutput>,
  outputAssertions?: (output: CreateAccountAliasOutput) => void,
): CreateAccountAliasOutputMatcher => {
  const expectCommandToSucceed = () =>
    createCreateAccountAliasOutputMatcher(executor, (output) => {
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

export interface ExecuteCreateAccountAliasCommand extends ExecuteCommandProps {
  readonly accountId: AccountId
  readonly alias: AccountAlias
}

export const executeCreateAccountAliasCommand = (
  props: ExecuteCreateAccountAliasCommand,
): CreateAccountAliasOutputMatcher =>
  createCreateAccountAliasOutputMatcher(async () => {
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

    return createAccountAliasCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestCreateAccountAliasIO(logger),
      input: {
        accountId: props.accountId,
        alias: props.alias,
        timer: createTimer("total"),
        outputFormat: "text",
      },
    })
  })
