import {
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const stack = { stackPath: "/sample.yml/eu-west-1", stackName: "sample" }
const projectDir = "configs/var-files-from-project-config-file"

describe("Variable files from project configuration", () => {
  test(
    "Deploy",
    withSingleAccountReservation(({ accountId, credentials }) =>
      executeDeployStacksCommand({ projectDir })
        .expectCommandToSucceed()
        .expectStackCreateSuccess(stack)
        .expectDeployedCfStack({
          ...stack,
          credentials,
          accountId,
          region: "eu-west-1",
          roleName: "OrganizationAccountAccessRole",
          expectedTags: {
            Code: "1234",
          },
        })
        .assert(),
    ),
  )
})
