import { anyArray, anyBoolean, mock } from "jest-mock-extended"
import { CommandPath } from "../../src/command/command-model.js"
import {
  ConfirmDeployAnswer,
  ConfirmStackDeployAnswer,
  DeployStacksIO,
} from "../../src/command/stacks/deploy/model.js"
import { DetectDriftIO } from "../../src/command/stacks/drift/model.js"
import { ListStacksIO } from "../../src/command/stacks/list/model.js"
import {
  ConfirmUndeployAnswer,
  UndeployStacksIO,
} from "../../src/command/stacks/undeploy/model.js"
import { DeploymentTargetsOperationIO } from "../../src/command/targets/operation/model.js"
import { DeploymentTargetsRunIO } from "../../src/command/targets/run/model.js"
import { ROOT_STACK_GROUP_PATH } from "../../src/takomo-stacks-model/constants.js"
import { TkmLogger } from "../../src/utils/logging.js"
import { createEmitStackTemplatesIO } from "../../src/cli-io/stacks/deploy-stacks/emit-stack-templates-io.js"
import { UserActions } from "../../src/cli-io/user-actions.js"
import { createDeployStacksIO } from "../../src/cli-io/stacks/deploy-stacks/deploy-stacks-io.js"
import { createUndeployStacksIO } from "../../src/cli-io/stacks/undeploy-stacks-io.js"
import { createListStacksIO } from "../../src/cli-io/stacks/list-stacks-io.js"
import { createDetectDriftIO } from "../../src/cli-io/stacks/detect-drift-io.js"
import { createDeployTargetsIO } from "../../src/cli-io/deployment-targets/deploy-targets-io.js"
import { createUndeployTargetsIO } from "../../src/cli-io/deployment-targets/undeploy-targets-io.js"
import { createRunTargetsIO } from "../../src/cli-io/deployment-targets/run-targets-io.js"

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

export const createTestDeployTargetsIO = (
  logger: TkmLogger,
): DeploymentTargetsOperationIO => createDeployTargetsIO({ logger })

export const createTestUndeployTargetsIO = (
  logger: TkmLogger,
): DeploymentTargetsOperationIO => createUndeployTargetsIO({ logger })

export const createTestRunTargetsIO = (
  logger: TkmLogger,
): DeploymentTargetsRunIO => createRunTargetsIO({ logger })

export const createTestEmitStackTemplatesIO = (
  logger: TkmLogger,
): DeployStacksIO => createEmitStackTemplatesIO({ logger })
