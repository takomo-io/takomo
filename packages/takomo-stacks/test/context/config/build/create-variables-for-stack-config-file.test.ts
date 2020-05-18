import { StackGroup } from "../../../../src"
import { createVariablesForStackConfigFile } from "../../../../src/context/config/build"

describe("#createVariablesForStackConfigFile", () => {
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
      name: "",
      path: "/",
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

    const stackVariables = createVariablesForStackConfigFile(
      variables,
      stackGroup,
    )

    expect(stackVariables).toStrictEqual({
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
        name: "",
        accountIds: ["123456789012", "222222222222"],
        project: "my project",
        regions: ["eu-west-1", "eu-north-1"],
        commandRole: {
          iamRoleArn: "arn:aws:iam::123456789012:role/admin",
        },
        path: "/",
        isRoot: true,
        templateBucket: {
          keyPrefix: "mytemplates/",
          name: "mybucket",
        },
        timeout: {
          create: 10,
          update: 20,
        },
        capabilities: ["CAPABILITY_IAM"],
        tags: {
          key: "value",
          foo: "bar",
        },
        data: {
          age: 12,
          code: "en",
          box: {
            key: "a",
          },
          list: [1, 2, 3],
        },
      },
    })
  })
})
