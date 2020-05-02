import { initOptionsAndVariables } from "@takomo/cli"
import { CliUndeployTargetsIO } from "@takomo/cli-io"
import { CommandStatus, DeploymentOperation, Options } from "@takomo/core"
import { deploymentTargetsOperationCommand } from "@takomo/deployment-targets"
import { TestDeployStacksIO, TestUndeployStacksIO } from "./io"
import { TIMEOUT } from "./test-constants"

const createOptions = async () =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs",
  })

describe("Deployment group commands", () => {
  it(
    "undeploy all",
    async () => {
      const { options, variables, watch } = await createOptions()

      const {
        results,
        status,
        success,
      } = await deploymentTargetsOperationCommand(
        {
          operation: DeploymentOperation.UNDEPLOY,
          targets: [],
          groups: [],
          configFile: null,
          options,
          variables,
          watch,
        },
        new CliUndeployTargetsIO(
          options,
          (options: Options, loggerName: string) =>
            new TestDeployStacksIO(options),
          (options: Options, loggerName: string) =>
            new TestUndeployStacksIO(options),
        ),
      )

      expect(status).toBe(CommandStatus.SUCCESS)
      expect(results).toHaveLength(2)
      expect(success).toBeTruthy()

      const [devGroup, testGroup] = results

      expect(devGroup.path).toBe("Environments/Dev")
      expect(devGroup.results).toHaveLength(2)
      expect(devGroup.success).toBeTruthy()
      expect(devGroup.status).toBe(CommandStatus.SUCCESS)

      const [t1, t2] = devGroup.results
      expect(t1.name).toBe("one")
      expect(t2.name).toBe("two")

      expect(testGroup.path).toBe("Environments/Test")
      expect(testGroup.results).toHaveLength(3)
      expect(testGroup.success).toBeTruthy()
      expect(testGroup.status).toBe(CommandStatus.SUCCESS)

      const [t3, t4, t5] = testGroup.results
      expect(t3.name).toBe("three")
      expect(t4.name).toBe("four")
      expect(t5.name).toBe("five")
    },
    TIMEOUT,
  )

  it(
    "deploy single deployment group",
    async () => {
      const { options, variables, watch } = await createOptions()

      const {
        results,
        status,
        success,
      } = await deploymentTargetsOperationCommand(
        {
          operation: DeploymentOperation.DEPLOY,
          targets: [],
          groups: ["Environments/Test"],
          configFile: null,
          options,
          variables,
          watch,
        },
        new CliUndeployTargetsIO(
          options,
          (options: Options, loggerName: string) =>
            new TestDeployStacksIO(options),
          (options: Options, loggerName: string) =>
            new TestUndeployStacksIO(options),
        ),
      )

      expect(status).toBe(CommandStatus.SUCCESS)
      expect(results).toHaveLength(1)
      expect(success).toBeTruthy()

      const [testGroup] = results

      expect(testGroup.path).toBe("Environments/Test")
      expect(testGroup.results).toHaveLength(3)
      expect(testGroup.success).toBeTruthy()
      expect(testGroup.status).toBe(CommandStatus.SUCCESS)

      const [t3, t4, t5] = testGroup.results
      expect(t3.name).toBe("three")
      expect(t4.name).toBe("four")
      expect(t5.name).toBe("five")
    },
    TIMEOUT,
  )

  it(
    "deploy single target",
    async () => {
      const { options, variables, watch } = await createOptions()

      const {
        results,
        status,
        success,
      } = await deploymentTargetsOperationCommand(
        {
          operation: DeploymentOperation.DEPLOY,
          targets: ["two"],
          groups: [],
          configFile: null,
          options,
          variables,
          watch,
        },
        new CliUndeployTargetsIO(
          options,
          (options: Options, loggerName: string) =>
            new TestDeployStacksIO(options),
          (options: Options, loggerName: string) =>
            new TestUndeployStacksIO(options),
        ),
      )

      expect(status).toBe(CommandStatus.SUCCESS)
      expect(results).toHaveLength(1)
      expect(success).toBeTruthy()

      const [devGroup] = results

      expect(devGroup.path).toBe("Environments/Dev")
      expect(devGroup.results).toHaveLength(1)
      expect(devGroup.success).toBeTruthy()
      expect(devGroup.status).toBe(CommandStatus.SUCCESS)

      const [t2] = devGroup.results
      expect(t2.name).toBe("two")
      expect(t2.status).toBe(CommandStatus.SUCCESS)
      expect(t2.results).toHaveLength(1)

      const [set1] = t2.results
      expect(set1.configSetName).toBe("logs")
      expect(set1.status).toBe(CommandStatus.SUCCESS)

      expect(set1.results).toHaveLength(1)
      expect(set1.results[0].commandPath).toBe("/logs.yml")
      expect(set1.results[0].result.results).toHaveLength(1)
      expect(set1.results[0].result.results[0].stack.getPath()).toBe(
        "/logs.yml/eu-west-1",
      )
    },
    TIMEOUT,
  )
})
