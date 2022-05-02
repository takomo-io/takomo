import { executeDeployStacksCommand } from "@takomo/test-integration/src"

const stackPath = "/tags.yml/eu-north-1",
  stackName = "tags",
  projectDir = "configs/tags"

describe("Stack tags", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath,
        stackName,
        expectDeployedStack: {
          tags: {
            first: "this is string value",
            second: "999",
            third: "true",
            fourth: "false",
            fifth: "0",
            sixth: "000001",
            seventh: "9",
          },
        },
      })
      .assert())
})
