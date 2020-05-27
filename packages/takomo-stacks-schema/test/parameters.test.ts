import { parameters } from "../src"

describe("parameters validation succeeds", () => {
  test("when a single parameter with static string value is given", () => {
    const { error } = parameters.validate({
      ParamName: "my value",
    })
    expect(error).toBeUndefined()
  })

  test("when a single parameter with static number value is given", () => {
    const { error } = parameters.validate({
      NumberParam: 10000,
    })
    expect(error).toBeUndefined()
  })

  test("when a single parameter with static boolean value is given", () => {
    const { error } = parameters.validate({
      BoolParam: true,
    })
    expect(error).toBeUndefined()
  })

  test("when a single parameters with resolvable value is given", () => {
    const { error } = parameters.validate({
      VpcId: {
        resolver: "stack-output",
        stack: "/vpc.yml",
        output: "VpcId",
      },
    })
    expect(error).toBeUndefined()
  })

  test("when a single confidential parameters with resolvable value", () => {
    const { error } = parameters.validate({
      VpcId: {
        resolver: "stack-output",
        confidential: true,
        stack: "/vpc.yml",
        output: "VpcId",
      },
    })
    expect(error).toBeUndefined()
  })

  test("when multiple parameters are given", () => {
    const { error } = parameters.validate({
      VpcId: {
        resolver: "external-stack-output",
        stack: "my-vpc-stack",
        output: "VpcId",
        region: "eu-west-1",
      },
      Hello: "world",
    })
    expect(error).toBeUndefined()
  })

  test("when a parameter with a list of strings is given", () => {
    const { error } = parameters.validate({
      SubnetIds: ["subnet-03b5a12f12feedb5e", "subnet-0ec116854df43c56a"],
    })

    expect(error).toBeUndefined()
  })

  test("when a parameter with a list of numbers is given", () => {
    const { error } = parameters.validate({
      SubnetIds: [1, 2, 3],
    })

    expect(error).toBeUndefined()
  })

  test("when a parameter with a list of booleans is given", () => {
    const { error } = parameters.validate({
      SubnetIds: [true, true, false],
    })

    expect(error).toBeUndefined()
  })

  test("when a parameter with a list of resolvers is given", () => {
    const { error } = parameters.validate({
      SomeParamaterName: [
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

    expect(error).toBeUndefined()
  })

  test("when a parameter with a mixed list is given", () => {
    const { error } = parameters.validate({
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

    expect(error).toBeUndefined()
  })
})
