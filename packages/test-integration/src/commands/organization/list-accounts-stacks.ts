import { initDefaultCredentialManager } from "@takomo/aws-clients"
import { AccountId } from "@takomo/aws-model"
import { ConfigSetName, ConfigSetType } from "@takomo/config-sets"
import {
  listAccountsStacksCommand,
  ListAccountsStacksOutput,
} from "@takomo/organization-commands"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { CommandPath } from "@takomo/stacks-model"
import { createConsoleLogger, createTimer } from "@takomo/util"
import { createTestListAccountsStacks } from "../../io"
import { ExecuteCommandProps } from "../common"
import { createCtxAndConfigRepository } from "./common"

interface ListAccountsStacksOutputMatcher {
  expectCommandToSucceed: () => ListAccountsStacksOutputMatcher
  assert: () => Promise<ListAccountsStacksOutput>
}

const createListAccountsStacksOutputMatcher = (
  executor: () => Promise<ListAccountsStacksOutput>,
  outputAssertions?: (output: ListAccountsStacksOutput) => void,
): ListAccountsStacksOutputMatcher => {
  const expectCommandToSucceed = () =>
    createListAccountsStacksOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<ListAccountsStacksOutput> => {
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

export interface ExecuteListAccountsStacksCommand extends ExecuteCommandProps {
  readonly organizationalUnits?: ReadonlyArray<OrganizationalUnitPath>
  readonly accountIds?: ReadonlyArray<AccountId>
  readonly concurrentAccounts?: number
  readonly configSetType: ConfigSetType
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
}

export const executeListAccountsStacksCommand = (
  props: ExecuteListAccountsStacksCommand,
): ListAccountsStacksOutputMatcher =>
  createListAccountsStacksOutputMatcher(async () => {
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

    return listAccountsStacksCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestListAccountsStacks(logger),
      input: {
        timer: createTimer("total"),
        outputFormat: "text",
        concurrentAccounts: props.concurrentAccounts ?? 20,
        commandPath: props.commandPath,
        configSetName: props.configSetName,
        configSetType: props.configSetType,
        accountIds: props.accountIds ?? [],
        organizationalUnits: props.organizationalUnits ?? [],
      },
    })
  })
