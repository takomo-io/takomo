/**
 * @testenv-recycler-count 2
 */

import { initOptionsAndVariables, OptionsAndVariables } from "@takomo/cli"
import { CliUndeployTargetsIO } from "@takomo/cli-io"
import { ConfigSetType } from "@takomo/config-sets"
import { CommandStatus, DeploymentOperation, Options } from "@takomo/core"
import { deploymentTargetsOperationCommand } from "@takomo/deployment-targets"
import { TestDeployStacksIO, TestUndeployStacksIO, TIMEOUT } from "@takomo/test"
import { Credentials } from "aws-sdk"

const createOptions = async (): Promise<OptionsAndVariables> => {
  const account1Id = global.reservation.accounts[0].accountId
  const account2Id = global.reservation.accounts[1].accountId
  return initOptionsAndVariables(
    {
      log: "info",
      yes: true,
      dir: "configs",
      var: [`ACCOUNT_1_ID=${account1Id}`, `ACCOUNT_2_ID=${account2Id}`],
    },
    new Credentials(global.reservation.credentials),
  )
}

describe("Deployment with project dir", () => {
  test(
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
          configSetType: ConfigSetType.STANDARD,
          targets: [],
          groups: [],
          configFile: "targets-3.yml",
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

      const [group] = results

      expect(group.path).toBe("GroupA/Child")
      expect(group.results).toHaveLength(2)
      expect(group.success).toBeTruthy()
      expect(group.status).toBe(CommandStatus.SUCCESS)

      const [t1, t2] = group.results
      expect(t1.name).toBe("one")
      expect(t2.name).toBe("two")
    },
    TIMEOUT,
  )

  test(
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
          configSetType: ConfigSetType.STANDARD,
          targets: [],
          groups: [],
          configFile: "targets-3.yml",
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

      expect(results).toHaveLength(1)
      expect(success).toBeTruthy()

      const [group] = results

      expect(group.path).toBe("GroupA/Child")
      expect(group.results).toHaveLength(2)
      expect(group.success).toBeTruthy()

      const [t1, t2] = group.results
      expect(t1.name).toBe("one")
      expect(t2.name).toBe("two")
    },
    TIMEOUT,
  )
})
