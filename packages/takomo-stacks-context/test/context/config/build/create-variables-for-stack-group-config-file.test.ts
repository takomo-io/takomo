import { StackGroup } from "@takomo/stacks-model"
import { createVariablesForStackGroupConfigFile } from "../../../../src/config/build"

describe("#createVariablesForStackGroupConfigFile", () => {
  test("returns correct variables", () => {
    const variables = {
      env: {
        PASSWORD: "abc",
      },
      var: {
        hello: "world",
      },
      context: {
        projectDir: "/tmp",
      },
    }

    const stackGroup = new StackGroup({
      accountIds: ["123456789012", "222222222222"],
      capabilities: ["CAPABILITY_IAM"],
      children: [],
      commandRole: {
        iamRoleArn: "arn:aws:iam::123456789012:role/admin",
      },
      data: {
        age: 12,
        code: "en",
        box: {
          key: "a",
        },
        list: [1, 2, 3],
      },
      hooks: [],
      ignore: false,
      isRoot: true,
      name: "cool",
      path: "/dev/apps/cool",
      project: "my project",
      regions: ["eu-west-1", "eu-north-1"],
      stacks: [],
      tags: new Map([
        ["key", "value"],
        ["foo", "bar"],
      ]),
      templateBucket: {
        keyPrefix: "mytemplates/",
        name: "mybucket",
      },
      timeout: {
        create: 10,
        update: 20,
      },
    })

    const stackGroupVariables = createVariablesForStackGroupConfigFile(
      variables,
      stackGroup,
    )

    expect(stackGroupVariables).toStrictEqual({
      env: {
        PASSWORD: "abc",
      },
      var: {
        hello: "world",
      },
      context: {
        projectDir: "/tmp",
      },
      stackGroup: {
        path: "/dev/apps/cool",
        name: "cool",
        pathSegments: ["dev", "apps", "cool"],
      },
    })
  })
})
