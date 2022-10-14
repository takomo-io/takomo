import { executeUndeployStacksCommand } from "../../src/commands/stacks"
import { pathToConfigs } from "../../src/util"
import { withSingleAccountReservation } from "../../src/reservations"

const projectDir = pathToConfigs("undeploy", "command-roles")

describe("Undeploy", () => {
  test("Should not attempt to assume command roles of stacks that are not selected for undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath: "/aaa/one.yml",
    })
      .expectCommandToSkip("Skipped")
      .expectSkippedStackResult({
        stackPath: "/aaa/one.yml/eu-north-1",
        message: "Stack not found",
        stackName: "aaa-one",
      })
      .assert())

  test(
    "Should fail if can't assume command roles",
    withSingleAccountReservation(({ accountId }) =>
      executeUndeployStacksCommand({
        projectDir,
        commandPath: "/bbb/two.yml",
      }).expectCommandToThrow(
        `is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::${accountId}:role/NonExistingRole`,
      ),
    ),
  )
})
