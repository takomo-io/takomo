import {
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const projectDir = "configs/cmd-hook-expose-stack-credentials"
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
        errorMessage:
          "Shell command exited with code 255.\n" +
          "\n" +
          "stderr:\n" +
          'Unable to locate credentials. You can configure credentials by running "aws configure".\n',
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
