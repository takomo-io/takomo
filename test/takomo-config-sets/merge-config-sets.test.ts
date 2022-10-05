import { mergeConfigSets } from "../../src/takomo-config-sets"

describe("#mergeConfigSets", () => {
  test("Empty inputs", () => {
    const merged = mergeConfigSets([], new Map())
    expect(merged).toStrictEqual([])
  })

  test("No externals", () => {
    const merged = mergeConfigSets(
      [
        {
          name: "a",
          description: "d",
          legacy: true,
          vars: {},
          commandPaths: ["/"],
        },
      ],
      new Map(),
    )
    expect(merged).toStrictEqual([
      {
        name: "a",
        description: "d",
        legacy: true,
        vars: {},
        commandPaths: ["/"],
      },
    ])
  })

  test("No matching externals", () => {
    const merged = mergeConfigSets(
      [
        {
          name: "a",
          description: "d",
          legacy: true,
          vars: {},
          commandPaths: ["/"],
        },
      ],
      new Map([
        [
          "b",
          {
            name: "b",
            description: "description",
            legacy: false,
            vars: {},
            commandPaths: ["/"],
          },
        ],
      ]),
    )
    expect(merged).toStrictEqual([
      {
        name: "a",
        description: "d",
        legacy: true,
        vars: {},
        commandPaths: ["/"],
      },
      {
        name: "b",
        description: "description",
        legacy: false,
        vars: {},
        commandPaths: ["/"],
      },
    ])
  })

  test("No legacy", () => {
    const merged = mergeConfigSets(
      [],
      new Map([
        [
          "b",
          {
            name: "b",
            description: "description",
            legacy: false,
            vars: {},
            commandPaths: ["/"],
          },
        ],
      ]),
    )
    expect(merged).toStrictEqual([
      {
        name: "b",
        description: "description",
        legacy: false,
        vars: {},
        commandPaths: ["/"],
      },
    ])
  })

  test("Matching externals", () => {
    const merged = mergeConfigSets(
      [
        {
          name: "a",
          description: "d",
          legacy: true,
          vars: {},
          commandPaths: ["/test", "/another"],
        },
      ],
      new Map([
        [
          "a",
          {
            name: "a",
            description: "",
            legacy: false,
            vars: {},
            commandPaths: ["/"],
          },
        ],
      ]),
    )
    expect(merged).toStrictEqual([
      {
        name: "a",
        description: "d",
        legacy: false,
        vars: {},
        commandPaths: ["/test", "/another"],
      },
    ])
  })
})
