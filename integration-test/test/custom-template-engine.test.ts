import { executeDeployStacksCommand } from "../src/commands/stacks.js"
import { withSingleAccountReservation } from "../src/reservations.js"

const stackPath = "/a.yml/eu-north-1",
  stackName = "a",
  projectDir = `${process.cwd()}/integration-test/configs/custom-template-engine`

describe("Custom template engine", () => {
  test(
    "Deploy",
    withSingleAccountReservation(({ accountId }) =>
      executeDeployStacksCommand({
        projectDir,
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess({
          stackPath,
          stackName,
          expectDeployedStack: {
            outputs: {
              accountId,
            },
          },
        })
        .assert(),
    ),
  )
})
