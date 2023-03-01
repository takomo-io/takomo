import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const stack = { stackPath: "/sample.yml/eu-west-1", stackName: "sample" }
const projectDir = `${process.cwd()}/integration-test/configs/var-files-from-project-config-file`

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
