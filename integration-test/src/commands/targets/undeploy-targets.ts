import { expect } from "@jest/globals"
import { basename } from "path"
import { deploymentTargetsOperationCommand } from "../../../../src/command/targets/operation/command.js"
import { createConsoleLogger } from "../../../../src/utils/logging.js"
import { Timer } from "../../../../src/utils/timer.js"
import { createTestUndeployTargetsIO } from "../../io.js"
import { createCtxAndConfigRepository } from "./common.js"
import {
  createTargetsOperationOutputMatcher,
  ExecuteDeployTargetsCommandProps,
  TargetsOperationOutputMatcher,
} from "./targets-operation.js"

export const executeUndeployTargetsCommand = (
  props: ExecuteDeployTargetsCommandProps,
): TargetsOperationOutputMatcher =>
  createTargetsOperationOutputMatcher(async () => {
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

    return deploymentTargetsOperationCommand({
      ...ctxAndConfig,
      io: createTestUndeployTargetsIO(logger),
      input: {
        timer: new Timer("total"),
        operation: "undeploy",
        groups: props.groups ?? [],
        targets: props.targets ?? [],
        excludeTargets: props.excludeTargets ?? [],
        labels: props.labels ?? [],
        excludeLabels: props.excludeLabels ?? [],
        concurrentTargets: props.concurrentTargets ?? 1,
        commandPath: props.commandPath,
        configSetName: props.configSetName,
        expectNoChanges: props.expectNoChanges ?? false,
        prune: props.prune ?? false,
        outputFormat: "text",
      },
    })
  })
