import { TakomoCredentialProvider } from "@takomo/core"
import { Stack } from "@takomo/stacks-model"
import { mock } from "jest-mock-extended"
import { createVariablesForStackTemplate } from "../../../src/stacks/deploy/template"

describe("#createVariablesForStackTemplate", () => {
  test("returns correct variables", () => {
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
      terminationProtection: false,
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
        terminationProtection: false,
      },
    })
  })
})
