import { expect } from "@jest/globals"
import { basename } from "path"
import { IamRoleArn, IamRoleName } from "../../../../src/aws/common/model.js"
import { deploymentTargetsRunCommand } from "../../../../src/command/targets/run/command.js"
import { DeploymentTargetsRunOutput } from "../../../../src/command/targets/run/model.js"
import { OutputFormat } from "../../../../src/takomo-core/command.js"
import { createConsoleLogger } from "../../../../src/utils/logging.js"
import { Timer } from "../../../../src/utils/timer.js"
import { createTestRunTargetsIO } from "../../io.js"
import { ExecuteCommandProps } from "../common.js"
import { createCtxAndConfigRepository } from "./common.js"

export interface TargetsRunOutputMatcher {
  readonly expectCommandToSucceed: (
    expectedResult: unknown,
  ) => TargetsRunOutputMatcher
  readonly assert: () => Promise<DeploymentTargetsRunOutput>
}

export const createTargetsRunOutputMatcher = (
  executor: () => Promise<DeploymentTargetsRunOutput>,
  outputAssertions?: (output: DeploymentTargetsRunOutput) => void,
): TargetsRunOutputMatcher => {
  const expectCommandToSucceed = (expectedResult: unknown) =>
    createTargetsRunOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()

      if (typeof expectedResult === "function") {
        expectedResult(output.result)
      } else {
        expect(output.result).toStrictEqual(expectedResult)
      }
    })

  const assert = async (): Promise<DeploymentTargetsRunOutput> => {
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

export interface ExecuteRunTargetsCommandProps extends ExecuteCommandProps {
  readonly groups?: ReadonlyArray<string>
  readonly targets?: ReadonlyArray<string>
  readonly excludeTargets?: ReadonlyArray<string>
  readonly labels?: ReadonlyArray<string>
  readonly excludeLabels?: ReadonlyArray<string>
  readonly configFile?: string
  readonly concurrentTargets?: number
  readonly mapCommand: string
  readonly mapArgs?: string
  readonly reduceCommand?: string
  readonly outputFormat?: OutputFormat
  readonly roleName?: IamRoleName
  readonly captureLastLine?: boolean
  readonly captureAfterLine?: string
  readonly captureBeforeLine?: string
  readonly disableMapRole?: boolean
  readonly reduceRoleArn?: IamRoleArn
}

export const executeRunTargetsCommand = (
  props: ExecuteRunTargetsCommandProps,
): TargetsRunOutputMatcher =>
  createTargetsRunOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const logger = createConsoleLogger({
      logLevel,
      name: basename(expect.getState().testPath!),
    })

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      pathToDeploymentConfigFile: props.configFile,
      feature: props.feature ?? [],
      logLevel,
      logger,
    })

    return deploymentTargetsRunCommand({
      ...ctxAndConfig,
      io: createTestRunTargetsIO(logger),
      input: {
        timer: new Timer("total"),
        groups: props.groups ?? [],
        targets: props.targets ?? [],
        excludeTargets: props.excludeTargets ?? [],
        labels: props.labels ?? [],
        excludeLabels: props.excludeLabels ?? [],
        concurrentTargets: props.concurrentTargets ?? 1,
        mapCommand: props.mapCommand,
        mapArgs: props.mapArgs,
        reduceCommand: props.reduceCommand,
        outputFormat: props.outputFormat ?? "text",
        captureLastLine: props.captureLastLine ?? false,
        captureBeforeLine: props.captureBeforeLine,
        captureAfterLine: props.captureAfterLine,
        mapRoleName: props.roleName,
        disableMapRole: props.disableMapRole ?? false,
        reduceRoleArn: props.reduceRoleArn,
      },
    })
  })
