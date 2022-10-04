import { evaluateRules } from "../../src/takomo-util"

describe("#evaluateRules", () => {
  test.concurrent(
    "returns the default value when no rules are given",
    async () => {
      const result = evaluateRules([], "string", (input: string) =>
        input.toUpperCase(),
      )
      expect(result).toBe("STRING")
    },
  )

  test.concurrent(
    "returns the default value when no rule matches with the input",
    async () => {
      const rule1 = (input: string) => (input === "COOL" ? 40 : undefined)
      const rule2 = (input: string) => undefined
      const rules = [rule1, rule2]

      const result = evaluateRules(rules, "hello", (input: string) => 1000)
      expect(result).toBe(1000)
    },
  )

  test.concurrent("returns the value from the matching rule", async () => {
    const rule1 = (input: string) => undefined
    const rule2 = (input: string) => (input === "COOL" ? 40 : undefined)
    const rule3 = (input: string) => (input === "NOT_COOL" ? 123 : undefined)
    const rules = [rule1, rule2, rule3]

    const result = evaluateRules(rules, "COOL", (input: string) => 1000)
    expect(result).toBe(40)
  })
})
