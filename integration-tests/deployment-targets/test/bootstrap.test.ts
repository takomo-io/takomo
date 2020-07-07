import { initOptionsAndVariables } from "@takomo/cli"
import { CliBootstrapTargetsIO, CliTearDownTargetsIO } from "@takomo/cli-io"
import { ConfigSetType } from "@takomo/config-sets"
import { CommandStatus, DeploymentOperation, Options } from "@takomo/core"
import { deploymentTargetsOperationCommand } from "@takomo/deployment-targets"
import { TestDeployStacksIO, TestUndeployStacksIO, TIMEOUT } from "@takomo/test"

const createOptions = async () =>
  initOptionsAndVariables({
    log: "info",
    yes: true,
    dir: "configs",
  })

describe("Bootstrapping", () => {
  test(
    "tear down all",
    async () => {
      const { options, variables, watch } = await createOptions()

      const {
        results,
        status,
        success,
      } = await deploymentTargetsOperationCommand(
        {
          operation: DeploymentOperation.UNDEPLOY,
          configSetType: ConfigSetType.BOOTSTRAP,
          targets: [],
          groups: [],
          configFile: "targets-4.yml",
          options,
          variables,
          watch,
        },
        new CliTearDownTargetsIO(
          options,
          (options: Options, loggerName: string) =>
            new TestDeployStacksIO(options),
          (options: Options, loggerName: string) =>
            new TestUndeployStacksIO(options),
        ),
      )

      expect(results).toHaveLength(1)
      expect(success).toBeTruthy()

      const [exampleGroup] = results

      expect(exampleGroup.path).toBe("Example")
      expect(exampleGroup.results).toHaveLength(1)
      expect(exampleGroup.success).toBeTruthy()
      expect(exampleGroup.status).toBe(CommandStatus.SUCCESS)

      const [target] = exampleGroup.results
      expect(target.name).toBe("two")
    },
    TIMEOUT,
  )

  test(
    "bootstrap all",
    async () => {
      const { options, variables, watch } = await createOptions()

      const {
        results,
        status,
        success,
      } = await deploymentTargetsOperationCommand(
        {
          operation: DeploymentOperation.DEPLOY,
          configSetType: ConfigSetType.BOOTSTRAP,
          targets: [],
          groups: [],
          configFile: "targets-4.yml",
          options,
          variables,
          watch,
        },
        new CliBootstrapTargetsIO(
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
      expect(exampleGroup.results).toHaveLength(1)
      expect(exampleGroup.success).toBeTruthy()
      expect(exampleGroup.status).toBe(CommandStatus.SUCCESS)

      const [target] = exampleGroup.results
      expect(target.name).toBe("two")
    },
    TIMEOUT,
  )
})
