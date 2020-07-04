import { initOptionsAndVariables } from "@takomo/cli"
import { CliUndeployTargetsIO } from "@takomo/cli-io"
import { CommandStatus, DeploymentOperation, Options } from "@takomo/core"
import { deploymentTargetsOperationCommand } from "@takomo/deployment-targets"
import { TestDeployStacksIO, TestUndeployStacksIO, TIMEOUT } from "@takomo/test"

const createOptions = async () =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs",
  })

describe("Deployment with deployment role", () => {
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
          configFile: "targets-2.yml",
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

      const [exampleGroup] = results

      expect(exampleGroup.path).toBe("Example")
      expect(exampleGroup.results).toHaveLength(2)
      expect(exampleGroup.success).toBeTruthy()
      expect(exampleGroup.status).toBe(CommandStatus.SUCCESS)

      const [t1, t2] = exampleGroup.results
      expect(t1.name).toBe("foo")
      expect(t2.name).toBe("bar")
    },
    TIMEOUT,
  )

  it(
    "deploy all",
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
          groups: [],
          configFile: "targets-2.yml",
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

      const [exampleGroup] = results

      expect(exampleGroup.path).toBe("Example")
      expect(exampleGroup.results).toHaveLength(2)
      expect(exampleGroup.success).toBeTruthy()
      expect(exampleGroup.status).toBe(CommandStatus.SUCCESS)

      const [t1, t2] = exampleGroup.results
      expect(t1.name).toBe("foo")
      expect(t2.name).toBe("bar")
    },
    TIMEOUT,
  )
})
