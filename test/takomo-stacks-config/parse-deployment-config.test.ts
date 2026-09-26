import { parseDeploymentConfig } from "../../src/parser/stacks/parse-deployment-config.js"

describe("#parseDeploymentConfig", () => {
  test("returns undefined when undefined is given", () => {
    expect(parseDeploymentConfig(undefined)).toBeUndefined()
  })

  test("returns undefined when null is given", () => {
    expect(parseDeploymentConfig(null)).toBeUndefined()
  })

  test("leaves missing properties undefined", () => {
    expect(parseDeploymentConfig({})).toStrictEqual({
      mode: undefined,
      disableRollback: undefined,
    })
  })

  test("parses mode only", () => {
    expect(parseDeploymentConfig({ mode: "EXPRESS" })).toStrictEqual({
      mode: "EXPRESS",
      disableRollback: undefined,
    })
  })

  test("parses disable rollback only", () => {
    expect(parseDeploymentConfig({ disableRollback: false })).toStrictEqual({
      mode: undefined,
      disableRollback: false,
    })
  })

  test("parses all properties", () => {
    expect(
      parseDeploymentConfig({ mode: "STANDARD", disableRollback: true }),
    ).toStrictEqual({
      mode: "STANDARD",
      disableRollback: true,
    })
  })
})
