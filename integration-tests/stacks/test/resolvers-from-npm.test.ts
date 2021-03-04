import {
  aws,
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"
import { Credentials } from "aws-sdk"

const projectDir = "configs/resolvers-from-npm"

const stack = {
  stackName: "aaa",
  stackPath: "/aaa.yml/eu-west-1",
}

describe("Custom resolvers from NPM packages", () => {
  test("Deploy", async () => {
    await executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(stack)
      .assert()

    const credentials = new Credentials(global.reservation.credentials)
    const iamRoleArn = `arn:aws:iam::${global.reservation.accounts[0].accountId}:role/OrganizationAccountAccessRole`

    const one = await aws.cloudFormation.describeStack({
      credentials,
      iamRoleArn,
      region: "eu-west-1",
      stackName: stack.stackName,
    })

    expect(
      one.Outputs!.sort((a, b) => a.OutputKey!.localeCompare(b.OutputKey!)),
    ).toStrictEqual([
      { OutputKey: "AnotherNameOutput", OutputValue: "HELLOHELLO" },
      { OutputKey: "CodeOutput", OutputValue: "123456890" },
      { OutputKey: "NameOutput", OutputValue: "HELLOHELLO" },
    ])
  })

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(stack)
      .assert())
})
