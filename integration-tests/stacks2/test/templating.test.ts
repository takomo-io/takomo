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
      .expectStackCreateSuccess({
        stackPath: "/not-dynamic.yml/eu-north-1",
        stackName: "not-dynamic",
      })
      .expectStackCreateSuccess({
        stackPath: "/another-not-dynamic.yml/eu-north-1",
        stackName: "another-not-dynamic",
      })
      .expectStackCreateSuccess({
        stackPath: "/dynamic.yml/eu-north-1",
        stackName: "dynamic",
      })
      .assert()

    const credentials = new Credentials(global.reservation.credentials)
    const iamRoleArn = `arn:aws:iam::${global.reservation.accounts[0].accountId}:role/OrganizationAccountAccessRole`

    const queuesStack = await aws.cloudFormation.describeStack({
      credentials,
      iamRoleArn,
      region: "eu-north-1",
      stackName: "queues",
    })

    expect(queuesStack.Description).toBe("IT - templating World")
    expect(queuesStack.Outputs).toStrictEqual([
      { OutputKey: "NumberParam", OutputValue: "300" },
      { OutputKey: "HelloParam", OutputValue: "World" },
    ])

    const dynamicStack = await aws.cloudFormation.describeStack({
      credentials,
      iamRoleArn,
      region: "eu-north-1",
      stackName: "dynamic",
    })

    expect(dynamicStack.Description).toBe("dynamic")

    const notDynamicStack = await aws.cloudFormation.describeStack({
      credentials,
      iamRoleArn,
      region: "eu-north-1",
      stackName: "not-dynamic",
    })
    expect(notDynamicStack.Description).toBe(
      "String with handlebars syntax {{ var.hello }}",
    )

    const anotherNotDynamicStack = await aws.cloudFormation.describeStack({
      credentials,
      iamRoleArn,
      region: "eu-north-1",
      stackName: "another-not-dynamic",
    })
    expect(anotherNotDynamicStack.Description).toBe(
      "Another string with handlebars syntax {{ var.hello }}",
    )
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
      .expectStackDeleteSuccess({
        stackPath: "/not-dynamic.yml/eu-north-1",
        stackName: "not-dynamic",
      })
      .expectStackDeleteSuccess({
        stackPath: "/another-not-dynamic.yml/eu-north-1",
        stackName: "another-not-dynamic",
      })
      .expectStackDeleteSuccess({
        stackPath: "/dynamic.yml/eu-north-1",
        stackName: "dynamic",
      })
      .assert())
})
