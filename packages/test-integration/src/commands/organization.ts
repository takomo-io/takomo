import {
  AccountAlias,
  AccountId,
  OrganizationFeatureSet,
} from "@takomo/aws-model"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import { InternalCommandContext } from "@takomo/core"
import {
  accountsOperationCommand,
  createAccountAliasCommand,
  createOrganizationCommand,
  deleteAccountAliasCommand,
  deployOrganizationCommand,
  describeOrganizationCommand,
  listAccountsCommand,
} from "@takomo/organization-commands"
import { OrganizationConfigRepository } from "@takomo/organization-context"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { createConsoleLogger, createTimer } from "@takomo/util"
import {
  AccountsOperationOutputMatcher,
  CreateAccountAliasOutputMatcher,
  createAccountsOperationOutputMatcher,
  createCreateAccountAliasOutputMatcher,
  createCreateOrganizationOutputMatcher,
  createDeleteAccountAliasOutputMatcher,
  createDeployOrganizationOutputMatcher,
  createDescribeOrganizationOutputMatcher,
  createListAccountsOutputMatcher,
  CreateOrganizationOutputMatcher,
  DeleteAccountAliasOutputMatcher,
  DeployOrganizationOutputMatcher,
  DescribeOrganizationOutputMatcher,
  ListAccountsOutputMatcher,
} from "../assertions/organization"
import {
  createTestBootstrapAccountsIO,
  createTestCreateAccountAliasIO,
  createTestCreateOrganizationIO,
  createTestDeleteAccountAliasIO,
  createTestDeployAccountsIO,
  createTestDeployOrganizationIO,
  createTestDescribeOrganizationIO,
  createTestListAccountsIO,
  createTestTeardownAccountsIO,
  createTestUndeployAccountsIO,
} from "../io"
import { createTestCommandContext, ExecuteCommandProps } from "./common"
import {
  CreateCtxAndConfigRepositoryProps,
  CreateTestStacksConfigRepositoryProps,
} from "./stacks"

interface CtxAndConfigRepository {
  ctx: InternalCommandContext
  configRepository: OrganizationConfigRepository
}

export const createTestOrganizationConfigRepository = async ({
  ctx,
}: CreateTestStacksConfigRepositoryProps): Promise<
  OrganizationConfigRepository
> =>
  createFileSystemOrganizationConfigRepository({
    ...ctx.filePaths,
    ctx,
    logger: createConsoleLogger({
      logLevel: ctx.logLevel,
    }),
  })

const createCtxAndConfigRepository = async (
  props: CreateCtxAndConfigRepositoryProps,
): Promise<CtxAndConfigRepository> => {
  const ctx = await createTestCommandContext(props)
  const configRepository = await createTestOrganizationConfigRepository({ ctx })
  return {
    ctx,
    configRepository,
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
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return createAccountAliasCommand({
      ...ctxAndConfig,
      io: createTestCreateAccountAliasIO(logger),
      input: {
        accountId: props.accountId,
        alias: props.alias,
        timer: createTimer("total"),
      },
    })
  })

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
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return deleteAccountAliasCommand({
      ...ctxAndConfig,
      io: createTestDeleteAccountAliasIO(logger),
      input: {
        accountId: props.accountId,
        timer: createTimer("total"),
      },
    })
  })

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
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return describeOrganizationCommand({
      ...ctxAndConfig,
      io: createTestDescribeOrganizationIO(logger),
      input: {
        timer: createTimer("total"),
      },
    })
  })

export interface ExecuteCreateOrganizationCommand extends ExecuteCommandProps {
  readonly featureSet: OrganizationFeatureSet
}

export const executeCreateOrganizationCommand = (
  props: ExecuteCreateOrganizationCommand,
): CreateOrganizationOutputMatcher =>
  createCreateOrganizationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return createOrganizationCommand({
      ...ctxAndConfig,
      io: createTestCreateOrganizationIO(logger),
      input: {
        timer: createTimer("total"),
        featureSet: props.featureSet,
      },
    })
  })

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
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return listAccountsCommand({
      ...ctxAndConfig,
      io: createTestListAccountsIO(logger),
      input: {
        timer: createTimer("total"),
      },
    })
  })

export interface ExecuteAccountsOperationCommandProps
  extends ExecuteCommandProps {
  readonly accountIds?: ReadonlyArray<AccountId>
  readonly organizationalUnits?: ReadonlyArray<OrganizationalUnitPath>
}

export const executeDeployAccountsCommand = (
  props: ExecuteAccountsOperationCommandProps,
): AccountsOperationOutputMatcher =>
  createAccountsOperationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return accountsOperationCommand({
      ...ctxAndConfig,
      io: createTestDeployAccountsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "standard",
        operation: "deploy",
        accountIds: props.accountIds ?? [],
        organizationalUnits: props.organizationalUnits ?? [],
      },
    })
  })

export const executeUndeployAccountsCommand = (
  props: ExecuteAccountsOperationCommandProps,
): AccountsOperationOutputMatcher =>
  createAccountsOperationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return accountsOperationCommand({
      ...ctxAndConfig,
      io: createTestUndeployAccountsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "standard",
        operation: "undeploy",
        accountIds: props.accountIds ?? [],
        organizationalUnits: props.organizationalUnits ?? [],
      },
    })
  })

export const executeBootstrapAccountsCommand = (
  props: ExecuteAccountsOperationCommandProps,
): AccountsOperationOutputMatcher =>
  createAccountsOperationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return accountsOperationCommand({
      ...ctxAndConfig,
      io: createTestBootstrapAccountsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "bootstrap",
        operation: "deploy",
        accountIds: props.accountIds ?? [],
        organizationalUnits: props.organizationalUnits ?? [],
      },
    })
  })

export const executeTeardownAccountsCommand = (
  props: ExecuteAccountsOperationCommandProps,
): AccountsOperationOutputMatcher =>
  createAccountsOperationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return accountsOperationCommand({
      ...ctxAndConfig,
      io: createTestTeardownAccountsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "bootstrap",
        operation: "undeploy",
        accountIds: props.accountIds ?? [],
        organizationalUnits: props.organizationalUnits ?? [],
      },
    })
  })

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
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return deployOrganizationCommand({
      ...ctxAndConfig,
      io: createTestDeployOrganizationIO(logger),
      input: {
        timer: createTimer("total"),
      },
    })
  })
