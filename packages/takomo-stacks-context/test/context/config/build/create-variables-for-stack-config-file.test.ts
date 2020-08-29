import { StackGroup } from "@takomo/stacks-model"
import { createVariablesForStackConfigFile } from "../../../../src/config/build"

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
      name: "regionName",
      path: "/applicationName/regionName",
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
      "/applicationName/regionName/stackName.yml",
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
        name: "regionName",
        accountIds: ["123456789012", "222222222222"],
        project: "my project",
        regions: ["eu-west-1", "eu-north-1"],
        commandRole: {
          iamRoleArn: "arn:aws:iam::123456789012:role/admin",
        },
        path: "/applicationName/regionName",
        pathSegments: ["applicationName", "regionName"],
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
      stack: {
        path: "/applicationName/regionName/stackName.yml",
        pathSegments: ["applicationName", "regionName", "stackName.yml"],
        configFile: {
          name: "stackName",
          basename: "stackName.yml",
          filePath: "applicationName/regionName/stackName.yml",
          dirPath: "applicationName/regionName",
        },
      },
    })
  })
})
