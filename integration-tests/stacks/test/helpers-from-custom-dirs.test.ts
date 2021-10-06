import {
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const stackName = "stack",
  stackPath = "/stack.yml/eu-north-1",
  projectDir = "configs/helpers-from-custom-dirs"

describe("Helpers from custom dirs", () => {
  test(
    "Deploy",
    withSingleAccountReservation(async ({ accountId, credentials }) =>
      executeDeployStacksCommand({ projectDir })
        .expectCommandToSucceed()
        .expectStackCreateSuccess({
          stackName,
          stackPath,
        })
        .expectDeployedCfStack({
          credentials,
          stackName,
          accountId,
          roleName: "OrganizationAccountAccessRole",
          region: "eu-north-1",
          expectedDescription: "CODE OTHER",
        })
        .assert(),
    ),
  )
})
