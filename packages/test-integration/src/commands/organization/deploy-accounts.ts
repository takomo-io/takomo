import { initDefaultCredentialManager } from "@takomo/aws-clients"
import { accountsOperationCommand } from "@takomo/organization-commands"
import { createConsoleLogger, createTimer } from "@takomo/util"
import { createTestDeployAccountsIO } from "../../io"
import {
  AccountsOperationOutputMatcher,
  createAccountsOperationOutputMatcher,
} from "./accounts-operation"
import {
  createCtxAndConfigRepository,
  ExecuteAccountsOperationCommandProps,
} from "./common"

export const executeDeployAccountsCommand = (
  props: ExecuteAccountsOperationCommandProps,
): AccountsOperationOutputMatcher =>
  createAccountsOperationOutputMatcher({
    stageAssertions: [],
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
        io: createTestDeployAccountsIO(logger),
        input: {
          timer: createTimer("total"),
          configSetType: "standard",
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
