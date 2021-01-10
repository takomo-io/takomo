import {
  aws,
  ExecuteCommandProps,
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"
import { Credentials } from "aws-sdk"

const props: ExecuteCommandProps = {
  projectDir: "configs/templating",
  logLevel: "debug",
  varFile: ["queues.yml"],
}

describe("Templating", () => {
  test("Deploy", async () => {
    await executeDeployStacksCommand(props)
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/queues.yml/eu-north-1",
        stackName: "queues",
      })
      .expectStackCreateSuccess({
        stackPath: "/topics.yml/eu-north-1",
        stackName: "topics",
      })
      .assert()

    const stack = await aws.cloudFormation.describeStack({
      credentials: new Credentials(global.reservation.credentials),
      iamRoleArn: `arn:aws:iam::${global.reservation.accounts[0].accountId}:role/OrganizationAccountAccessRole`,
      region: "eu-north-1",
      stackName: "queues",
    })
    expect(stack.Description).toBe("IT - templating World")

    const outputs = stack.Outputs!
    expect(outputs).toHaveLength(2)

    const sortedOutputs = outputs.sort((a, b) =>
      a.OutputKey!.localeCompare(b.OutputKey!),
    )

    expect(sortedOutputs[0].OutputKey).toBe("HelloParam")
    expect(sortedOutputs[0].OutputValue).toBe("World")

    expect(sortedOutputs[1].OutputKey).toBe("NumberParam")
    expect(sortedOutputs[1].OutputValue).toBe("300")
  })

  test("Undeploy", () =>
    executeUndeployStacksCommand(props)
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackPath: "/queues.yml/eu-north-1",
        stackName: "queues",
      })
      .expectStackDeleteSuccess({
        stackPath: "/topics.yml/eu-north-1",
        stackName: "topics",
      })
      .assert())
})
