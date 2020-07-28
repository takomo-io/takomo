import { makeSecretsPath } from "../../../../src/config/secrets"

describe("make secrets path", () => {
  test("for a stack under root stack group without project", () => {
    const secretsPath = makeSecretsPath("/rds.yml/eu-west-1", null)
    expect(secretsPath).toBe("/rds.yml/eu-west-1/")
  })

  test("for a stack under root stack group with project", () => {
    const secretsPath = makeSecretsPath("/vpc.yml/us-east-1", "example")
    expect(secretsPath).toBe("/example/vpc.yml/us-east-1/")
  })

  test("for a stack not under root stack group without project", () => {
    const secretsPath = makeSecretsPath("/a/b/c/vpc.yml/eu-central-1", null)
    expect(secretsPath).toBe("/a/b/c/vpc.yml/eu-central-1/")
  })

  test("for a stack not under root stack group with project", () => {
    const secretsPath = makeSecretsPath("/x/y/kms.yml/eu-west-1", "cool")
    expect(secretsPath).toBe("/cool/x/y/kms.yml/eu-west-1/")
  })
})
