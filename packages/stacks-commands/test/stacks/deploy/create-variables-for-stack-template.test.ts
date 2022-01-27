import { Credentials } from "@aws-sdk/types"
import { CredentialManager } from "@takomo/aws-clients"
import { InternalStack } from "@takomo/stacks-model"
import { createConsoleLogger } from "@takomo/util"
import { mock } from "jest-mock-extended"
import { createVariablesForStackTemplate } from "../../../src/stacks/deploy/steps/prepare-template"

const logger = createConsoleLogger({
  logLevel: "info",
})

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

    const stack: InternalStack = {
      accountIds: [],
      capabilities: [],
      commandRole: {
        iamRoleArn: "arn:aws:iam::888888888888:role/admin",
      },
      credentialManager: mock<CredentialManager>(),
      data: {
        age: 1,
        name: "James",
        prop: {
          fuz: "baz",
        },
      },
      dependents: [],
      dependencies: ["/vpc.yml"],
      hooks: [],
      ignore: false,
      obsolete: false,
      terminationProtection: false,
      name: "stack-x",
      parameters: new Map(),
      path: "/stack-x.yml/eu-west-1",
      project: "foobar",
      region: "eu-central-1",
      tags: new Map([
        ["a", "b"],
        ["c", "d"],
      ]),
      template: { filename: "vpc.json", dynamic: true },
      templateBucket: {
        keyPrefix: "prefixation",
        name: "b",
      },
      timeout: {
        update: 4,
        create: 3,
      },
      stackGroupPath: "/",
      logger,
      credentials: mock<Credentials>(),
      getCurrentCloudFormationStack: jest.fn(),
      getCloudFormationClient: jest.fn(),
      toProps: jest.fn(),
    }

    const parameters = [
      {
        key: "foo",
        value: "fooValue",
        immutable: false,
      },
      {
        key: "bar",
        value: "barValue",
        immutable: false,
      },
    ]

    const stackVariables = createVariablesForStackTemplate(
      variables,
      stack,
      parameters,
    )

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
        tags: [
          {
            key: "a",
            value: "b",
          },
          { key: "c", value: "d" },
        ],
        parameters: [
          {
            key: "foo",
            value: "fooValue",
          },
          {
            key: "bar",
            value: "barValue",
          },
        ],
        parametersMap: {
          foo: "fooValue",
          bar: "barValue",
        },
        depends: ["/vpc.yml"],
        terminationProtection: false,
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

    const stack: InternalStack = {
      accountIds: [],
      capabilities: [],
      credentialManager: mock<CredentialManager>(),
      data: {
        arrayData: [1, 2, 3],
      },
      dependents: [],
      dependencies: [],
      hooks: [],
      ignore: false,
      obsolete: false,
      terminationProtection: false,
      name: "stack-x",
      parameters: new Map(),
      path: "/dev/apps/prod/eb.yml/eu-north-1",
      region: "eu-north-1",
      tags: new Map([["Name", "Value"]]),
      template: { filename: "elastic-beanstalk.yml", dynamic: false },
      timeout: {
        update: 40,
        create: 0,
      },
      stackGroupPath: "/dev/apps/prod",
      logger,
      credentials: mock<Credentials>(),
      getCurrentCloudFormationStack: jest.fn(),
      getCloudFormationClient: jest.fn(),
      toProps: jest.fn(),
    }

    const stackVariables = createVariablesForStackTemplate(variables, stack, [])

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
        project: undefined,
        path: "/dev/apps/prod/eb.yml/eu-north-1",
        pathSegments: ["dev", "apps", "prod", "eb.yml", "eu-north-1"],
        region: "eu-north-1",
        template: "elastic-beanstalk.yml",
        templateBucket: undefined,
        commandRole: undefined,
        data: {
          arrayData: [1, 2, 3],
        },
        timeout: {
          update: 40,
          create: 0,
        },
        tags: [
          {
            key: "Name",
            value: "Value",
          },
        ],
        parameters: [],
        parametersMap: {},
        depends: [],
        terminationProtection: false,
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
