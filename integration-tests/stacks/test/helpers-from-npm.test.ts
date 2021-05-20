import {
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const stackName = "stack1",
  stackPath = "/stack1.yml/eu-north-1",
  projectDir = "configs/helpers-from-npm"

describe("Helpers from npm", () => {
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
          stackName,
          accountId,
          credentials,
          region: "eu-north-1",
          roleName: "OrganizationAccountAccessRole",
          expectedTags: {
            Tag1: "ONE",
            Tag2: "two",
            Tag3: "THREE",
          },
        })
        .assert(),
    ),
  )
})
