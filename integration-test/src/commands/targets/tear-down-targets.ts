import { basename } from "path"
import { deploymentTargetsOperationCommand } from "../../../../src/command/targets/operation/command"
import { createConsoleLogger } from "../../../../src/utils/logging"
import { Timer } from "../../../../src/utils/timer"
import { createTestTeardownTargetsIO } from "../../io"
import { createCtxAndConfigRepository } from "./common"
import {
  createTargetsOperationOutputMatcher,
  ExecuteDeployTargetsCommandProps,
  TargetsOperationOutputMatcher,
} from "./targets-operation"

export const executeTeardownTargetsCommand = (
  props: ExecuteDeployTargetsCommandProps,
): TargetsOperationOutputMatcher =>
  createTargetsOperationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "error"

    const logger = createConsoleLogger({
      logLevel,
      name: basename(expect.getState().testPath),
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
      io: createTestTeardownTargetsIO(logger),
      input: {
        timer: new Timer("total"),
        configSetType: "bootstrap",
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
