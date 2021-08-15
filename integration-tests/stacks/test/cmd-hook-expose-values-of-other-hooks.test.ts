import {
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const projectDir = "configs/cmd-hook-expose-values-of-other-hooks"
const stack = {
  stackName: "hooks",
  stackPath: "/hooks.yml/eu-north-1",
}

describe("Cmd hook", () => {
  test(
    "Exposes values of other hooks",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({
        projectDir,
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess({
          stackName: "hooks",
          stackPath: "/hooks.yml/eu-north-1",
        })
        .expectDeployedCfStack({
          ...stack,
          credentials,
          accountId,
          region: "eu-north-1",
          roleName: "OrganizationAccountAccessRole",
          expectedOutputs: {
            One: "HELLO",
          },
        })
        .assert(),
    ),
  )
})
