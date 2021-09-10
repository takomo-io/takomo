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
  createDetectDriftIO,
  createInitProjectIO,
  createListAccountsIO,
  createListAccountsStacksIO,
  createListStacksIO,
  createRunTargetsIO,
  createTearDownAccountsIO,
  createTearDownTargetsIO,
  createUndeployAccountsIO,
  createUndeployStacksIO,
  createUndeployTargetsIO,
  UserActions,
} from "@takomo/cli-io"
import {
  DeploymentTargetsOperationIO,
  DeploymentTargetsRunIO,
} from "@takomo/deployment-targets-commands"
import { InitProjectIO } from "@takomo/init-command"
import {
  AccountsOperationIO,
  CreateAccountAliasIO,
  CreateOrganizationIO,
  DeleteAccountAliasIO,
  DeployOrganizationIO,
  DescribeOrganizationIO,
  ListAccountsIO,
  ListAccountsStacksIO,
} from "@takomo/organization-commands"
import {
  ConfirmDeployAnswer,
  ConfirmStackDeployAnswer,
  ConfirmUndeployAnswer,
  DeployStacksIO,
  DetectDriftIO,
  ListStacksIO,
  UndeployStacksIO,
} from "@takomo/stacks-commands"
import { CommandPath, ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { TkmLogger } from "@takomo/util"
import { anyArray, anyBoolean, mock } from "jest-mock-extended"

export interface TestDeployStacksIOAnswers {
  confirmDeploy: ConfirmDeployAnswer
  confirmStackDeploy: ConfirmStackDeployAnswer
  chooseCommandPath: CommandPath
}

export const createTestDeployStacksIO = (
  logger: TkmLogger,
  answers: TestDeployStacksIOAnswers = {
    confirmDeploy: "CANCEL",
    confirmStackDeploy: "CANCEL",
    chooseCommandPath: ROOT_STACK_GROUP_PATH,
  },
): DeployStacksIO => {
  const actions = mock<UserActions>()

  // Mock confirm deploy
  actions.choose
    .calledWith("How do you want to continue?", anyArray(), anyBoolean())
    .mockReturnValue(Promise.resolve(answers.confirmDeploy))

  // Mock confirm single stack deploy
  actions.choose
    .calledWith(
      "How do you want to continue the deployment?",
      anyArray(),
      anyBoolean(),
    )
    .mockReturnValue(Promise.resolve(answers.confirmStackDeploy))

  return {
    ...createDeployStacksIO({ logger, actions }),
    chooseCommandPath: async (): Promise<CommandPath> =>
      answers.chooseCommandPath,
  }
}

export interface TestUndeployStacksIOAnswers {
  confirmUndeploy: ConfirmUndeployAnswer
  chooseCommandPath: CommandPath
}

export const createTestUndeployStacksIO = (
  logger: TkmLogger,
  autoConfirmEnabled = true,
  answers: TestUndeployStacksIOAnswers = {
    confirmUndeploy: "CANCEL",
    chooseCommandPath: "/",
  },
): UndeployStacksIO => ({
  ...createUndeployStacksIO({ logger }),
  confirmUndeploy: async (): Promise<ConfirmUndeployAnswer> =>
    autoConfirmEnabled ? "CONTINUE" : answers.confirmUndeploy,
  chooseCommandPath: async (): Promise<CommandPath> =>
    answers.chooseCommandPath,
})

export const createTestListStacksIO = (logger: TkmLogger): ListStacksIO =>
  createListStacksIO({ logger })

export const createTestDetectDriftIO = (logger: TkmLogger): DetectDriftIO =>
  createDetectDriftIO({ logger })

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

export const createTestRunTargetsIO = (
  logger: TkmLogger,
): DeploymentTargetsRunIO => createRunTargetsIO({ logger })

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

export const createTestListAccountsStacks = (
  logger: TkmLogger,
): ListAccountsStacksIO => createListAccountsStacksIO({ logger })
