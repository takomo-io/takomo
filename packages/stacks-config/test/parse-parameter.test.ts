import { ParameterConfig } from "../src"
import { parseParameter } from "../src/parse-parameter"

const singleParameterCases: Array<[unknown, ParameterConfig]> = [
  [
    "hello",
    {
      value: "hello",
      confidential: undefined,
      immutable: false,
      resolver: "static",
      schema: undefined,
    },
  ],
  [
    100,
    {
      value: 100,
      confidential: undefined,
      immutable: false,
      resolver: "static",
      schema: undefined,
    },
  ],
  [
    false,
    {
      value: false,
      confidential: undefined,
      immutable: false,
      resolver: "static",
      schema: undefined,
    },
  ],
  [
    {
      value: "foobar",
    },
    {
      value: "foobar",
      confidential: undefined,
      immutable: false,
      resolver: "static",
      schema: undefined,
    },
  ],
  [
    {
      value: "foobar",
      confidential: false,
    },
    {
      value: "foobar",
      confidential: false,
      immutable: false,
      resolver: "static",
      schema: undefined,
    },
  ],
  [
    {
      value: "foobar",
      confidential: true,
    },
    {
      value: "foobar",
      confidential: true,
      immutable: false,
      resolver: "static",
      schema: undefined,
    },
  ],
  [
    {
      value: "foobar",
      immutable: true,
    },
    {
      value: "foobar",
      confidential: undefined,
      immutable: true,
      resolver: "static",
      schema: undefined,
    },
  ],
  [
    {
      value: "foobar",
      immutable: false,
      confidential: true,
    },
    {
      value: "foobar",
      confidential: true,
      immutable: false,
      resolver: "static",
      schema: undefined,
    },
  ],
]

const listParameterCases: Array<[
  unknown,
  boolean | undefined,
  boolean,
  ParameterConfig[],
]> = [
  [
    ["a", "b", "c"],
    undefined,
    false,
    [
      {
        value: "a",
        confidential: undefined,
        immutable: false,
        resolver: "static",
        schema: undefined,
      },
      {
        value: "b",
        confidential: undefined,
        immutable: false,
        resolver: "static",
        schema: undefined,
      },
      {
        value: "c",
        confidential: undefined,
        immutable: false,
        resolver: "static",
        schema: undefined,
      },
    ],
  ],
  [
    [1],
    undefined,
    false,
    [
      {
        value: 1,
        confidential: undefined,
        immutable: false,
        resolver: "static",
        schema: undefined,
      },
    ],
  ],
  [
    {
      value: ["1", 2],
    },
    undefined,
    false,
    [
      {
        value: "1",
        confidential: undefined,
        immutable: false,
        resolver: "static",
        schema: undefined,
      },
      {
        value: 2,
        confidential: undefined,
        immutable: false,
        resolver: "static",
        schema: undefined,
      },
    ],
  ],
  [
    {
      confidential: true,
      immutable: false,
      value: ["foobar"],
      schema: undefined,
    },
    true,
    false,
    [
      {
        value: "foobar",
        confidential: undefined,
        immutable: false,
        resolver: "static",
        schema: undefined,
      },
    ],
  ],
  [
    {
      immutable: true,
      value: [
        {
          resolver: "stack-output",
          stack: "/db.yml",
          output: "VpcId",
          schema: undefined,
        },
      ],
    },
    undefined,
    true,
    [
      {
        confidential: undefined,
        immutable: false,
        resolver: "stack-output",
        stack: "/db.yml",
        output: "VpcId",
        schema: undefined,
      },
    ],
  ],
  [
    [
      {
        resolver: "stack-output",
        stack: "/db.yml",
        output: "Subnet1",
        schema: undefined,
      },
      {
        resolver: "external-stack-output",
        stack: "vpc",
        output: "VpcId",
        schema: undefined,
      },
      100,
    ],
    undefined,
    false,
    [
      {
        confidential: undefined,
        immutable: false,
        resolver: "stack-output",
        stack: "/db.yml",
        output: "Subnet1",
        schema: undefined,
      },
      {
        confidential: undefined,
        immutable: false,
        resolver: "external-stack-output",
        stack: "vpc",
        output: "VpcId",
        schema: undefined,
      },
      {
        confidential: undefined,
        immutable: false,
        resolver: "static",
        value: 100,
        schema: undefined,
      },
    ],
  ],
]

describe("#parseParameter", () => {
  test.each(singleParameterCases)(
    "returns correct single parameter config object, case %#",
    (value, expected) => {
      const config = parseParameter(value)
      if (!config.isList) {
        expect(config.config).toStrictEqual(expected)
      } else {
        fail("Expected config to be SingleParameterConfig")
      }
    },
  )

  test.each(listParameterCases)(
    "returns correct list parameter config object, case %#",
    (value, expectedConfidential, expectedImmutable, expectedConfigs) => {
      const config = parseParameter(value)
      if (config.isList) {
        expect(config.confidential).toBe(expectedConfidential)
        expect(config.immutable).toBe(expectedImmutable)
        expect(config.items).toStrictEqual(expectedConfigs)
        expect(config.schema).toBeUndefined()
      } else {
        fail("Expected config to be ListParameterConfig")
      }
    },
  )
})
