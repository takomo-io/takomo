import { executeDeployStacksCommand } from "@takomo/test-integration"

const stack = { stackPath: "/sample.yml/eu-west-1", stackName: "sample" }
const projectDir = "configs/var-files-from-project-config-file"

describe("Variable files from project configuration", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        ...stack,
        expectDeployedStack: {
          tags: {
            Code: "1234",
          },
        },
      })
      .assert())
})
