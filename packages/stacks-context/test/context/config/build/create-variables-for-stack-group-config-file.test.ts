import { StackGroup } from "@takomo/stacks-model"
import { createVariablesForStackGroupConfigFile } from "../../../../src/config/create-variables-for-stack-group-config-file"

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

    const stackGroup: StackGroup = {
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
      obsolete: false,
      terminationProtection: false,
      root: true,
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
      toProps: jest.fn(),
    }

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
      parent: undefined,
    })
  })

  test("returns correct variables when parent is defined", () => {
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

    const stackGroup: StackGroup = {
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
      obsolete: false,
      terminationProtection: false,
      root: true,
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
      toProps: jest.fn(),
    }

    const parent: StackGroup = {
      accountIds: ["444433332222"],
      capabilities: [],
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
      obsolete: false,
      terminationProtection: false,
      root: true,
      name: "regionName",
      path: "/applicationName/regionName",
      project: "my project",
      regions: ["eu-west-1", "eu-north-1"],
      stacks: [],
      tags: new Map([["hello", "world"]]),
      templateBucket: {
        keyPrefix: "mytemplates/",
        name: "mybucket",
      },
      timeout: {
        create: 10,
        update: 20,
      },
      toProps: jest.fn(),
    }

    const stackGroupVariables = createVariablesForStackGroupConfigFile(
      variables,
      stackGroup,
      parent,
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
      parent: {
        name: "regionName",
        accountIds: ["444433332222"],
        project: "my project",
        regions: ["eu-west-1", "eu-north-1"],
        commandRole: {
          iamRoleArn: "arn:aws:iam::123456789012:role/admin",
        },
        path: "/applicationName/regionName",
        pathSegments: ["applicationName", "regionName"],
        isRoot: true,
        terminationProtection: false,
        templateBucket: {
          keyPrefix: "mytemplates/",
          name: "mybucket",
        },
        timeout: {
          create: 10,
          update: 20,
        },
        capabilities: [],
        tags: [
          {
            key: "hello",
            value: "world",
          },
        ],
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
