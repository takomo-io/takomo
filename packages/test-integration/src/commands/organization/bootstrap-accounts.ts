import { initDefaultCredentialManager } from "@takomo/aws-clients"
import {
  accountsOperationCommand,
  AccountsOperationOutput,
} from "@takomo/organization-commands"
import { StacksOperationOutput } from "@takomo/stacks-commands"
import { StackResult } from "@takomo/stacks-model"
import { createConsoleLogger, createTimer } from "@takomo/util"
import { createTestBootstrapAccountsIO } from "../../io"
import {
  AccountsOperationOutputMatcher,
  createAccountsOperationOutputMatcher,
  ExpectStackResultProps,
  StackOperationResultAssertionProvider,
} from "./accounts-operation"
import {
  createCtxAndConfigRepository,
  ExecuteAccountsOperationCommandProps,
} from "./common"

export const executeBootstrapAccountsCommand = (
  props: ExecuteAccountsOperationCommandProps,
): AccountsOperationOutputMatcher<
  ExpectStackResultProps,
  StackResult,
  StacksOperationOutput,
  AccountsOperationOutput
> =>
  createAccountsOperationOutputMatcher({
    stageAssertions: [],
    stackResultAssertionProvider: StackOperationResultAssertionProvider,
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

      return accountsOperationCommand({
        ...ctxAndConfig,
        credentialManager,
        io: createTestBootstrapAccountsIO(logger),
        input: {
          timer: createTimer("total"),
          configSetType: "bootstrap",
          operation: "deploy",
          accountIds: props.accountIds ?? [],
          organizationalUnits: props.organizationalUnits ?? [],
          concurrentAccounts: props.concurrentAccounts ?? 1,
          configSetName: props.configSetName,
          commandPath: props.commandPath,
          outputFormat: "text",
        },
      })
    },
  })
