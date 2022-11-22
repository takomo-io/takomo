import { createStacksSchemas } from "../../../src/schema/stacks-schema"
import { expectNoValidationError } from "../../assertions"

const { parameters } = createStacksSchemas({
  regions: [],
})

const assertNoValidationError = (value: unknown): void =>
  expectNoValidationError(parameters)(value)

describe("parameters validation succeeds", () => {
  test("single parameter with static string value", () => {
    assertNoValidationError({
      ParamName: "my value",
    })
  })

  test("single parameter with static empty string value", () => {
    assertNoValidationError({
      ParamName: "",
    })
  })

  test("single parameter with static number value", () => {
    assertNoValidationError({
      NumberParam: 10000,
    })
  })

  test("single parameter with static boolean value", () => {
    assertNoValidationError({
      BoolParam: true,
    })
  })

  test("single parameters with resolvable value is given", () => {
    assertNoValidationError({
      VpcId: {
        resolver: "stack-output",
        stack: "/vpc.yml",
        output: "VpcId",
      },
    })
  })

  test("single confidential parameters with resolvable value", () => {
    assertNoValidationError({
      VpcId: {
        resolver: "stack-output",
        confidential: true,
        stack: "/vpc.yml",
        output: "VpcId",
      },
    })
  })

  test("multiple parameters are given", () => {
    assertNoValidationError({
      VpcId: {
        resolver: "external-stack-output",
        stack: "my-vpc-stack",
        output: "VpcId",
        region: "eu-west-1",
      },
      Hello: "world",
    })
  })

  test("parameter with a list of strings", () => {
    assertNoValidationError({
      SubnetIds: ["subnet-03b5a12f12feedb5e", "subnet-0ec116854df43c56a"],
    })
  })

  test("parameter with a list of numbers", () => {
    assertNoValidationError({
      SubnetIds: [1, 2, 3],
    })
  })

  test("parameter with a list of booleans", () => {
    assertNoValidationError({
      SubnetIds: [true, true, false],
    })
  })

  test("parameter with a list of resolvers", () => {
    assertNoValidationError({
      SomeParameterName: [
        {
          resolver: "stack-output",
          stack: "/my-vpc-stack.yml",
          output: "VpcId",
          region: "eu-west-1",
        },
        {
          resolver: "external-stack-output",
          stack: "my-vpc-stack",
          output: "VpcId",
          region: "us-east-1",
        },
      ],
    })
  })

  test("parameter with a mixed list", () => {
    assertNoValidationError({
      MyParam: [
        "hello world",
        10000,
        true,
        {
          resolver: "external-stack-output",
          stack: "my-vpc-stack",
          output: "VpcId",
          region: "us-east-1",
        },
      ],
    })
  })

  test("string static configurable parameter", () => {
    assertNoValidationError({
      MyParam: {
        value: "hello",
      },
    })
  })

  test("number static configurable parameter", () => {
    assertNoValidationError({
      MyParam: {
        value: 1234,
      },
    })
  })

  test("boolean static configurable parameter", () => {
    assertNoValidationError({
      MyParam: {
        value: true,
      },
    })
  })

  test("list static configurable parameter", () => {
    assertNoValidationError({
      MyParam: {
        value: ["a", "b", "c"],
      },
    })
  })

  test("list of mixed types static configurable parameter", () => {
    assertNoValidationError({
      MyParam: {
        value: ["a", 1, false],
      },
    })
  })

  test("static immutable configurable parameter with", () => {
    assertNoValidationError({
      MyParam: {
        value: 1234,
        immutable: true,
      },
    })
  })

  test("static immutable confidential configurable parameter with", () => {
    assertNoValidationError({
      MyParam: {
        value: "foo",
        immutable: true,
        confidential: false,
      },
    })
  })

  test("single immutable parameter with resolvable value", () => {
    assertNoValidationError({
      VpcId: {
        resolver: "stack-output",
        immutable: true,
        stack: "/vpc.yml",
        output: "VpcId",
      },
    })
  })
})
