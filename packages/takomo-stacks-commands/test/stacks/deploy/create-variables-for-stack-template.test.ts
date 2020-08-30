import { TakomoCredentialProvider } from "@takomo/core"
import { Stack } from "@takomo/stacks-model"
import { mock } from "jest-mock-extended"
import { createVariablesForStackTemplate } from "../../../src/stacks/deploy/template"

describe("#createVariablesForStackTemplate", () => {
  test("returns correct variables #1", () => {
    const variables = {
      env: {
        COLOR: "0",
      },
      var: {
        DEBUG: "true",
      },
      context: {
        projectDir: "/tmp",
      },
      hooks: {},
    }

    const stack = new Stack({
      accountIds: [],
      capabilities: [],
      commandRole: {
        iamRoleArn: "arn:aws:iam::888888888888:role/admin",
      },
      credentialProvider: mock<TakomoCredentialProvider>(),
      data: {
        age: 1,
        name: "James",
        prop: {
          fuz: "baz",
        },
      },
      dependants: [],
      dependencies: ["/vpc.yml"],
      hooks: [],
      ignore: false,
      name: "stack-x",
      parameters: new Map(),
      path: "/stack-x.yml/eu-west-1",
      project: "foobar",
      region: "eu-central-1",
      secrets: new Map(),
      secretsPath: "/stack-x.yml/eu-west-1",
      tags: new Map([
        ["a", "b"],
        ["c", "d"],
      ]),
      template: "vpc.json",
      templateBucket: {
        keyPrefix: "prefixation",
        name: "b",
      },
      timeout: {
        update: 4,
        create: 3,
      },
    })

    const stackVariables = createVariablesForStackTemplate(variables, stack)

    expect(stackVariables).toStrictEqual({
      env: {
        COLOR: "0",
      },
      var: {
        DEBUG: "true",
      },
      context: {
        projectDir: "/tmp",
      },
      hooks: {},
      stack: {
        name: "stack-x",
        project: "foobar",
        path: "/stack-x.yml/eu-west-1",
        pathSegments: ["stack-x.yml", "eu-west-1"],
        region: "eu-central-1",
        template: "vpc.json",
        templateBucket: {
          keyPrefix: "prefixation",
          name: "b",
        },
        commandRole: {
          iamRoleArn: "arn:aws:iam::888888888888:role/admin",
        },
        data: {
          age: 1,
          name: "James",
          prop: {
            fuz: "baz",
          },
        },
        timeout: {
          update: 4,
          create: 3,
        },
        tags: {
          a: "b",
          c: "d",
        },
        depends: ["/vpc.yml"],
        configFile: {
          basename: "stack-x.yml",
          name: "stack-x",
          filePath: "stack-x.yml",
          dirPath: "",
        },
      },
    })
  })

  test("returns correct variables #2", () => {
    const variables = {
      env: {},
      var: {
        nested: {
          code: 123,
        },
      },
      context: {
        projectDir: "/var/files",
      },
      hooks: {
        myHook: "ok",
      },
    }

    const stack = new Stack({
      accountIds: [],
      capabilities: [],
      commandRole: null,
      credentialProvider: mock<TakomoCredentialProvider>(),
      data: {
        arrayData: [1, 2, 3],
      },
      dependants: [],
      dependencies: [],
      hooks: [],
      ignore: false,
      name: "stack-x",
      parameters: new Map(),
      path: "/dev/apps/prod/eb.yml/eu-north-1",
      project: null,
      region: "eu-north-1",
      secrets: new Map(),
      secretsPath: "/dev/apps/prod/eb.yml/eu-north-1",
      tags: new Map([["Name", "Value"]]),
      template: "elastic-beanstalk.yml",
      templateBucket: null,
      timeout: {
        update: 40,
        create: 0,
      },
    })

    const stackVariables = createVariablesForStackTemplate(variables, stack)

    expect(stackVariables).toStrictEqual({
      env: {},
      var: {
        nested: {
          code: 123,
        },
      },
      context: {
        projectDir: "/var/files",
      },
      hooks: { myHook: "ok" },
      stack: {
        name: "stack-x",
        project: null,
        path: "/dev/apps/prod/eb.yml/eu-north-1",
        pathSegments: ["dev", "apps", "prod", "eb.yml", "eu-north-1"],
        region: "eu-north-1",
        template: "elastic-beanstalk.yml",
        templateBucket: null,
        commandRole: null,
        data: {
          arrayData: [1, 2, 3],
        },
        timeout: {
          update: 40,
          create: 0,
        },
        tags: {
          Name: "Value",
        },
        depends: [],
        configFile: {
          basename: "eb.yml",
          name: "eb",
          filePath: "dev/apps/prod/eb.yml",
          dirPath: "dev/apps/prod",
        },
      },
    })
  })
})
