import {
  createBootstrapTargetsIO,
  createDeployStacksIO,
  createDeployTargetsIO,
  createDetectDriftIO,
  createInitProjectIO,
  createListStacksIO,
  createRunTargetsIO,
  createTearDownTargetsIO,
  createUndeployStacksIO,
  createUndeployTargetsIO,
  UserActions,
} from "@takomo/cli-io"
import { Choice } from "@takomo/cli-io/src/cli-io"
import { QuestionOptions } from "@takomo/cli-io/src/user-actions"
import {
  DeploymentTargetsOperationIO,
  DeploymentTargetsRunIO,
} from "@takomo/deployment-targets-commands"
import { InitProjectIO } from "@takomo/init-command"
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
  const actions: UserActions = {
    confirm: async (message: string, marginTop: boolean): Promise<boolean> => {
      logger.info(`confirm invoked with message: ${message}`)
      throw new Error("Not implemented")
    },
    question: async (
      message: string,
      marginTop: boolean,
      options: QuestionOptions,
    ): Promise<string> => {
      logger.info(
        `question invoked with message: ${message}, options: ${JSON.stringify(
          options,
        )}`,
      )
      throw new Error("Not implemented")
    },
    choose: async <T>(
      message: string,
      choices: Choice<T>[],
      marginTop: boolean,
    ): Promise<T> => {
      logger.info(
        `choose invoked with message: ${message}, choices: ${JSON.stringify(
          choices,
        )}`,
      )
      if (message === "How do you want to continue?") {
        logger.info(`Return answer: ${answers.confirmDeploy}`)
        return answers.confirmDeploy as unknown as T
      }
      if (message === "How do you want to continue the deployment?") {
        logger.info(`Return answer: ${answers.confirmStackDeploy}`)
        return answers.confirmStackDeploy as unknown as T
      }

      throw new Error("Not implemented")
    },
    chooseMany: async <T>(
      message: string,
      choices: Choice<T>[],
      marginTop: boolean,
    ): Promise<T[]> => {
      logger.info(
        `chooseMany invoked with message: ${message}, choices: ${JSON.stringify(
          choices,
        )}`,
      )
      throw new Error("Not implemented")
    },
    autocomplete: async (
      message: string,
      source: (answersSoFar: any, input: string) => Promise<string[]>,
    ): Promise<string> => {
      logger.info(`chooseMany invoked with message: ${message}`)
      throw new Error("Not implemented")
    },
  }
  //
  // // Mock confirm deploy
  // actions.choose
  //   .calledWith("How do you want to continue?", anyArray(), anyBoolean())
  //   .mockReturnValue(Promise.resolve(answers.confirmDeploy))
  //
  // // Mock confirm single stack deploy
  // actions.choose
  //   .calledWith(
  //     "How do you want to continue the deployment?",
  //     anyArray(),
  //     anyBoolean(),
  //   )
  //   .mockReturnValue(Promise.resolve(answers.confirmStackDeploy))

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

export const createTestTeardownTargetsIO = (
  logger: TkmLogger,
): DeploymentTargetsOperationIO => createTearDownTargetsIO({ logger })

export const createTestBootstrapTargetsIO = (
  logger: TkmLogger,
): DeploymentTargetsOperationIO => createBootstrapTargetsIO({ logger })

export const createTestRunTargetsIO = (
  logger: TkmLogger,
): DeploymentTargetsRunIO => createRunTargetsIO({ logger })

export const createTestInitProjectIO = (logger: TkmLogger): InitProjectIO =>
  createInitProjectIO({ logger })
