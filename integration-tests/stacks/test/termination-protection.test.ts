import {
  aws,
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"
import { TakomoError } from "@takomo/util/src"
import { Credentials } from "aws-sdk"

const stackName = "termination-protection"
const stackPath = "/a.yml/eu-north-1"
const projectDir = "configs/termination-protection"

describe("Termination protection", () => {
  test("Create a stack with termination protection enabled", async () => {
    await executeDeployStacksCommand({
      projectDir,
      var: ["terminationProtection=true"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert()

    const stack = await aws.cloudFormation.describeStack({
      stackName,
      credentials: new Credentials(global.reservation.credentials),
      iamRoleArn: `arn:aws:iam::${global.reservation.accounts[0].accountId}:role/OrganizationAccountAccessRole`,
      region: "eu-north-1",
    })
    expect(stack.EnableTerminationProtection).toBeTruthy()
  })

  test("Try to undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["terminationProtection=false"],
    }).expectCommandToThrow(
      new TakomoError(
        "Can't undeploy stacks because following stacks have termination protection enabled:\n\n" +
          "  - /a.yml/eu-north-1",
      ),
    ))

  test("Disable termination protection", async () => {
    await executeDeployStacksCommand({
      projectDir,
      var: ["terminationProtection=false"],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccess({
        stackName,
        stackPath,
      })
      .assert()

    const stack = await aws.cloudFormation.describeStack({
      credentials: new Credentials(global.reservation.credentials),
      iamRoleArn: `arn:aws:iam::${global.reservation.accounts[0].accountId}:role/OrganizationAccountAccessRole`,
      stackName: "termination-protection",
      region: "eu-north-1",
    })
    expect(stack.EnableTerminationProtection).toBeFalsy()
  })

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["terminationProtection=false"],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackName,
        stackPath,
      })
      .assert())
})
