import {
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const projectDir = "configs/checksum-hook",
  stackPath = "/stack.yml/eu-west-1",
  stackName = "stack"

describe("Checksum hook", () => {
  test(
    "Deploy",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({ projectDir })
        .expectCommandToSucceed()
        .expectStackCreateSuccess({
          stackName,
          stackPath,
        })
        .expectDeployedCfStack({
          accountId,
          credentials,
          stackName,
          region: "eu-west-1",
          roleName: "OrganizationAccountAccessRole",
          expectedOutputs: {
            Checksum: "KBUSI+pY0rw2rs9H7eqjuDUKoxk=",
            Checksum2: "571c86eec81a3afb8f0dc87bb3a16dcb7578a544",
          },
        })
        .assert(),
    ),
  )
})
