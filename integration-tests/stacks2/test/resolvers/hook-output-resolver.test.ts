import {
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const projectDir = "configs/resolvers/hook-output"
const stack = {
  stackPath: "/logs.yml/eu-west-1",
  stackName: "logs",
}

describe("Hook output resolver", () => {
  test(
    "Deploy",
    withSingleAccountReservation(({ credentials, accountId }) =>
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
              {
                OutputKey: "Name",
                OutputValue: "ABCDEFG1234",
              },
            ],
          },
        })
        .assert(),
    ),
  )
})
