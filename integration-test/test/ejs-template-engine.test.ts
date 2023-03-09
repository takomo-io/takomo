import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const stackPath = "/a.yml/eu-north-1",
  stackName = "a",
  projectDir = `${process.cwd()}/integration-test/configs/ejs-template-engine`

describe("Ejs template engine", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["message=COOL"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath,
        stackName,
        expectDeployedStack: {
          outputs: {
            First: "COOL",
            Second: "using Ejs",
          },
        },
      })
      .assert())
})
