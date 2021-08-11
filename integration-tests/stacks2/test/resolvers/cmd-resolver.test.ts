import {
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const projectDir = "configs/resolvers/cmd"
const stack = {
  stackPath: "/vpc.yml/eu-west-1",
  stackName: "vpc",
}

describe("Command resolver", () => {
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
          expected: {
            Outputs: [
              { OutputKey: "LastLine", OutputValue: "line 6" },
              { OutputKey: "ConfidentialParamValue", OutputValue: "hello" },
              { OutputKey: "NonConfidentialParamValue", OutputValue: "world" },
            ],
          },
        })
        .assert(),
    ),
  )
})
