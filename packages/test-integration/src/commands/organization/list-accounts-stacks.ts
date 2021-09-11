import { initDefaultCredentialManager } from "@takomo/aws-clients"
import { AccountId, StackName, StackStatus } from "@takomo/aws-model"
import { ConfigSetName, ConfigSetType } from "@takomo/config-sets"
import {
  listAccountsStacksCommand,
  ListAccountsStacksOutput,
} from "@takomo/organization-commands"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { ListStacksOutput, StackInfo } from "@takomo/stacks-commands"
import { CommandPath, StackPath } from "@takomo/stacks-model"
import { createConsoleLogger, createTimer } from "@takomo/util"
import { createTestListAccountsStacks } from "../../io"
import { ExecuteCommandProps } from "../common"
import {
  AccountsOperationOutputMatcher,
  createAccountsOperationOutputMatcher,
  StackResultAssertionProvider,
} from "./accounts-operation"
import { createCtxAndConfigRepository } from "./common"

export interface ExecuteListAccountsStacksCommand extends ExecuteCommandProps {
  readonly organizationalUnits?: ReadonlyArray<OrganizationalUnitPath>
  readonly accountIds?: ReadonlyArray<AccountId>
  readonly concurrentAccounts?: number
  readonly configSetType: ConfigSetType
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
}

export interface ExpectListStackProps {
  readonly stackName: StackName
  readonly stackPath: StackPath
  readonly status?: StackStatus
}

export const ListStacksResultAssertionProvider: StackResultAssertionProvider<
  ExpectListStackProps,
  StackInfo
> = (props: ExpectListStackProps) => (result: StackInfo) => {
  expect(result.path).toStrictEqual(props.stackPath)
  expect(result.name).toStrictEqual(props.stackName)
  expect(result.status).toStrictEqual(props.status)
}

export const executeListAccountsStacksCommand = (
  props: ExecuteListAccountsStacksCommand,
): AccountsOperationOutputMatcher<
  ExpectListStackProps,
  StackInfo,
  ListStacksOutput,
  ListAccountsStacksOutput
> =>
  createAccountsOperationOutputMatcher({
    stageAssertions: [],
    stackResultAssertionProvider: ListStacksResultAssertionProvider,
    executor: async () => {
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
    },
  })
