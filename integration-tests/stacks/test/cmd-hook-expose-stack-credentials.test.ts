import {
  aws,
  executeDeployStacksCommand,
  withTestReservation,
} from "@takomo/test-integration"

const projectDir = "configs/cmd-hook-expose-stack-credentials"

describe("Cmd hook that exposes stack credentials", () => {
  test("Deploy without exposing credentials fails", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["exposeStackCredentials=false"],
    })
      .expectCommandToFail("Failed")
      .expectFailureStackResult({
        stackName: "hooks",
        stackPath: "/hooks.yml/eu-central-1",
        errorMessage:
          "Command failed: ./get-caller-identity.sh\n" +
          'Unable to locate credentials. You can configure credentials by running "aws configure".\n',
        message: "Error",
      })
      .assert())

  test(
    "Deploy with exposing credentials succeeds",
    withTestReservation(async ({ accountIds, credentials }) => {
      await executeDeployStacksCommand({
        projectDir,
        var: ["exposeStackCredentials=true"],
      })
        .expectCommandToSucceed()
        .expectStackCreateSuccess({
          stackName: "hooks",
          stackPath: "/hooks.yml/eu-central-1",
        })
        .assert()

      const iamRoleArn = `arn:aws:iam::${accountIds[0]}:role/OrganizationAccountAccessRole`

      const stack = await aws.cloudFormation.describeStack({
        credentials,
        iamRoleArn,
        region: "eu-central-1",
        stackName: "hooks",
      })

      expect(stack.Description).toBe(`hook1=${accountIds[0]}`)
    }),
  )
})
