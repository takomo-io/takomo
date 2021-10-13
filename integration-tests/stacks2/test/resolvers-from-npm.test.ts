import { executeDeployStacksCommand } from "@takomo/test-integration"

const projectDir = "configs/resolvers-from-npm",
  stackName = "aaa",
  stackPath = "/aaa.yml/eu-west-1"

describe("Custom resolvers from NPM packages", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({ stackName, stackPath })
      .expectDeployedCfStackV2({
        stackPath,
        outputs: {
          AnotherNameOutput: "HELLOHELLO",
          CodeOutput: "123456890",
          NameOutput: "HELLOHELLO",
        },
      })
      .assert())
})
