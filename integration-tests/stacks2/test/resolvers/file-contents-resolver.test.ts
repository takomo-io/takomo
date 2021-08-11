import {
  executeDeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"

const projectDir = "configs/resolvers/file-contents"
const stack = {
  stackPath: "/logs.yml/eu-west-1",
  stackName: "logs",
}

describe("File contents resolver", () => {
  test("Deploy fails if file doesn't exist", () =>
    executeDeployStacksCommand({ projectDir, var: ["file=not-existing"] })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        ...stack,
        errorMessage: `File ${process.cwd()}/configs/resolvers/file-contents/not-existing not found`,
      })
      .assert())

  test(
    "Deploy",
    withSingleAccountReservation(({ credentials, accountId }) =>
      executeDeployStacksCommand({ projectDir, var: ["file=name.txt"] })
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
                OutputValue: "VpcLogs",
              },
            ],
          },
        })
        .assert(),
    ),
  )

  test(
    "Deploy with file from a subdir",
    withSingleAccountReservation(({ credentials, accountId }) =>
      executeDeployStacksCommand({
        projectDir,
        var: ["file=dir/name2.txt"],
      })
        .expectCommandToSucceed()
        .expectStackUpdateSuccess(stack)
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
                OutputValue: "Zorro",
              },
            ],
          },
        })
        .assert(),
    ),
  )
})
