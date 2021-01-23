import {
  createBootstrapAccountsIO,
  createBootstrapTargetsIO,
  createCreateAccountAliasIO,
  createCreateOrganizationIO,
  createDeleteAccountAliasIO,
  createDeployAccountsIO,
  createDeployOrganizationIO,
  createDeployStacksIO,
  createDeployTargetsIO,
  createDescribeOrganizationIO,
  createInitProjectIO,
  createListAccountsIO,
  createListStacksIO,
  createTearDownAccountsIO,
  createTearDownTargetsIO,
  createUndeployAccountsIO,
  createUndeployStacksIO,
  createUndeployTargetsIO,
} from "@takomo/cli-io"
import { DeploymentTargetsOperationIO } from "@takomo/deployment-targets-commands"
import { InitProjectIO } from "@takomo/init-command"
import {
  AccountsOperationIO,
  CreateAccountAliasIO,
  CreateOrganizationIO,
  DeleteAccountAliasIO,
  DeployOrganizationIO,
  DescribeOrganizationIO,
  ListAccountsIO,
} from "@takomo/organization-commands"
import {
  ConfirmDeployAnswer,
  ConfirmStackDeployAnswer,
  ConfirmUndeployAnswer,
  DeployStacksIO,
  ListStacksIO,
  UndeployStacksIO,
} from "@takomo/stacks-commands"
import { TkmLogger } from "@takomo/util"

export interface TestDeployStacksIOAnswers {
  confirmDeploy: ConfirmDeployAnswer
  confirmStackDeploy: ConfirmStackDeployAnswer
}

export const createTestDeployStacksIO = (
  logger: TkmLogger,
  autoConfirmEnabled = true,
  answers: TestDeployStacksIOAnswers = {
    confirmDeploy: "CANCEL",
    confirmStackDeploy: "CANCEL",
  },
): DeployStacksIO => ({
  ...createDeployStacksIO({ logger }),

  confirmDeploy: async (): Promise<ConfirmDeployAnswer> =>
    autoConfirmEnabled ? "CONTINUE_NO_REVIEW" : answers.confirmDeploy,

  confirmStackDeploy: async (): Promise<ConfirmStackDeployAnswer> =>
    autoConfirmEnabled ? "CONTINUE" : answers.confirmStackDeploy,
})

export interface TestUndeployStacksIOAnswers {
  confirmUndeploy: ConfirmUndeployAnswer
}

export const createTestUndeployStacksIO = (
  logger: TkmLogger,
  autoConfirmEnabled = true,
  answers: TestUndeployStacksIOAnswers = {
    confirmUndeploy: "CANCEL",
  },
): UndeployStacksIO => ({
  ...createUndeployStacksIO({ logger }),
  confirmUndeploy: async (): Promise<ConfirmUndeployAnswer> =>
    autoConfirmEnabled ? "CONTINUE" : answers.confirmUndeploy,
})

export const createTestListStacksIO = (logger: TkmLogger): ListStacksIO =>
  createListStacksIO({ logger })

export const createTestCreateAccountAliasIO = (
  logger: TkmLogger,
): CreateAccountAliasIO => createCreateAccountAliasIO({ logger })

export const createTestDeleteAccountAliasIO = (
  logger: TkmLogger,
): DeleteAccountAliasIO => createDeleteAccountAliasIO({ logger })

export const createTestDescribeOrganizationIO = (
  logger: TkmLogger,
): DescribeOrganizationIO => createDescribeOrganizationIO({ logger })

export const createTestCreateOrganizationIO = (
  logger: TkmLogger,
): CreateOrganizationIO => createCreateOrganizationIO({ logger })

export const createTestDeployTargetsIO = (
  logger: TkmLogger,
): DeploymentTargetsOperationIO => createDeployTargetsIO({ logger })

export const createTestUndeployTargetsIO = (
  logger: TkmLogger,
): DeploymentTargetsOperationIO => createUndeployTargetsIO({ logger })

export const createTestTeardownTargetsIO = (
  logger: TkmLogger,
): DeploymentTargetsOperationIO => createTearDownTargetsIO({ logger })

export const createTestBootstrapTargetsIO = (
  logger: TkmLogger,
): DeploymentTargetsOperationIO => createBootstrapTargetsIO({ logger })

export const createTestListAccountsIO = (logger: TkmLogger): ListAccountsIO =>
  createListAccountsIO({ logger })

export const createTestDeployAccountsIO = (
  logger: TkmLogger,
): AccountsOperationIO => createDeployAccountsIO({ logger })

export const createTestUndeployAccountsIO = (
  logger: TkmLogger,
): AccountsOperationIO => createUndeployAccountsIO({ logger })

export const createTestTeardownAccountsIO = (
  logger: TkmLogger,
): AccountsOperationIO => createTearDownAccountsIO({ logger })

export const createTestBootstrapAccountsIO = (
  logger: TkmLogger,
): AccountsOperationIO => createBootstrapAccountsIO({ logger })

export const createTestDeployOrganizationIO = (
  logger: TkmLogger,
): DeployOrganizationIO => createDeployOrganizationIO({ logger })

export const createTestInitProjectIO = (logger: TkmLogger): InitProjectIO =>
  createInitProjectIO({ logger })
