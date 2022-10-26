import { executeUndeployStacksCommand } from "../../src/commands/stacks"
import { withSingleAccountReservation } from "../../src/reservations"
import { pathToConfigs } from "../../src/util"

const projectDir = pathToConfigs("undeploy", "command-roles")

describe("Undeploy", () => {
  test("Should not attempt to assume command roles of stacks that are not selected for undeploy", () =>
    executeUndeployStacksCommand({
      commandPath: "/aaa/one.yml/eu-north-1",
      projectDir,
    })
      .expectCommandToSkip("Skipped")
      .expectSkippedStackResult({
        stackPath: "/aaa/one.yml/eu-north-1",
        message: "Stack not found",
        stackName: "aaa-one",
      })
      .assert())

  test("In interactive mode, should not attempt to assume command roles of stacks that are not selected for undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      interactive: true,
      answers: {
        confirmUndeploy: "CONTINUE",
        chooseCommandPath: "/aaa/one.yml",
      },
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
