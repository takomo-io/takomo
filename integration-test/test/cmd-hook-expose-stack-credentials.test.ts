import { executeDeployStacksCommand } from "../src/commands/stacks.js"
import { withSingleAccountReservation } from "../src/reservations.js"

const projectDir = `${process.cwd()}/integration-test/configs/cmd-hook-expose-stack-credentials`
const stack = {
  stackName: "hooks",
  stackPath: "/hooks.yml/eu-central-1",
}

describe("Cmd hook that exposes stack credentials", () => {
  test("Deploy without exposing credentials fails", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["exposeStackCredentials=false"],
    })
      .expectCommandToFail("Failed")
      .expectFailureStackResult({
        ...stack,
        errorMessageToContain: "Unable to locate credentials",
        message: "Error",
      })
      .assert())

  test(
    "Deploy with exposing credentials succeeds",
    withSingleAccountReservation(({ accountId }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["exposeStackCredentials=true"],
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess({
          stackName: "hooks",
          stackPath: "/hooks.yml/eu-central-1",
        })
        .expectDeployedCfStackV2({
          ...stack,
          description: `hook1=${accountId}`,
        })
        .assert(),
    ),
  )
})
