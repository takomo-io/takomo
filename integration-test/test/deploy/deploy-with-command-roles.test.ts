import { executeDeployStacksCommand } from "../../src/commands/stacks"
import { withSingleAccountReservation } from "../../src/reservations"
import { pathToConfigs } from "../../src/util"

const projectDir = pathToConfigs("deploy", "command-roles")

describe("Deploy", () => {
  test("In interactive mode, should not attempt to assume command roles of stacks that are not selected for deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      interactive: true,
      answers: {
        chooseCommandPath: "/aaa/one.yml",
        confirmDeploy: "CONTINUE_NO_REVIEW",
        confirmStackDeploy: "CONTINUE_AND_SKIP_REMAINING_REVIEWS",
      },
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/aaa/one.yml/eu-north-1",
        stackName: "aaa-one",
      })
      .assert())

  test(
    "Should fail if can't assume command roles",
    withSingleAccountReservation(({ accountId }) =>
      executeDeployStacksCommand({
        projectDir,
        commandPath: "/bbb/two.yml",
      }).expectCommandToThrow(
        `is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::${accountId}:role/NonExistingRole`,
      ),
    ),
  )
})
