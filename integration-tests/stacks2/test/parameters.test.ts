import { executeDeployStacksCommand } from "@takomo/test-integration"

describe("Parameters", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir: "configs/parameters" })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/vpc.yml/eu-north-1",
        stackName: "examples-parameters-vpc",
      })
      .assert())
})
