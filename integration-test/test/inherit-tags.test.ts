import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/inherit-tags`

const a = {
  stackName: "group-a",
  stackPath: "/group/a.yml/eu-north-1",
}
const b = {
  stackName: "group-b",
  stackPath: "/group/b.yml/eu-north-1",
}
const c = {
  stackName: "group-c",
  stackPath: "/group/c.yml/eu-north-1",
}
const d = {
  stackName: "group-another-d",
  stackPath: "/group/another/d.yml/eu-north-1",
}
const e = {
  stackName: "group-another-e",
  stackPath: "/group/another/e.yml/eu-north-1",
}

describe("Inherit tags property", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(a, b, c, d, e)
      .expectDeployedCfStackV2({
        ...a,
        tags: {
          code: "123",
        },
      })
      .expectDeployedCfStackV2({
        ...b,
        tags: {
          foo: "bar",
          hello: "world",
        },
      })
      .expectDeployedCfStackV2({
        ...c,
        tags: {
          foo: "bar",
          hello: "world",
          code: "456",
        },
      })
      .expectDeployedCfStackV2({
        ...d,
        tags: {
          jolly: "roger",
          code: "789",
        },
      })
      .expectDeployedCfStackV2({
        ...e,
        tags: {
          code: "100",
        },
      })
      .assert())
})
