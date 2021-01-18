import { aws, executeDeployStacksCommand } from "@takomo/test-integration"
import { Credentials } from "aws-sdk"

describe("Tag inheritance", () => {
  test("Deploy", async () => {
    await executeDeployStacksCommand({
      projectDir: "configs/tag-inheritance",
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "three",
        stackPath: "/three.yml/eu-north-1",
      })
      .expectStackCreateSuccess({
        stackName: "aaa-two",
        stackPath: "/aaa/two.yml/eu-north-1",
      })
      .expectStackCreateSuccess({
        stackName: "aaa-bbb-one",
        stackPath: "/aaa/bbb/one.yml/eu-north-1",
      })
      .assert()

    const credentials = new Credentials(global.reservation.credentials)
    const iamRoleArn = `arn:aws:iam::${global.reservation.accounts[0].accountId}:role/OrganizationAccountAccessRole`

    const three = await aws.cloudFormation.describeStack({
      credentials,
      iamRoleArn,
      region: "eu-north-1",
      stackName: "three",
    })

    expect(three.Tags).toStrictEqual([
      { Key: "foo", Value: "bar" },
      { Key: "fux", Value: "baz" },
      { Key: "hello", Value: "world" },
    ])

    const two = await aws.cloudFormation.describeStack({
      credentials,
      iamRoleArn,
      region: "eu-north-1",
      stackName: "aaa-two",
    })

    expect(two.Tags).toStrictEqual([
      { Key: "foo", Value: "bar1" },
      { Key: "fux", Value: "baz" },
      { Key: "hello", Value: "world" },
    ])

    const one = await aws.cloudFormation.describeStack({
      credentials,
      iamRoleArn,
      region: "eu-north-1",
      stackName: "aaa-bbb-one",
    })

    expect(one.Tags).toStrictEqual([
      { Key: "foo", Value: "bar1" },
      { Key: "fux", Value: "new-value" },
      { Key: "hello", Value: "world" },
    ])
  })
})
