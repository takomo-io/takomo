import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/blueprints`

describe("blueprints", () => {
  test("deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "a-better-name",
        stackPath: "/my-stack1.yml/eu-north-1",
        expectDeployedStack: {
          outputs: {
            OtherMessage: "Goodbye, James!",
          },
        },
      })
      .expectStackCreateSuccess({
        stackName: "sample-blueprint1",
        stackPath: "/my-stack2.yml/eu-central-1",
        expectDeployedStack: {
          outputs: {
            Message: "Hello Spider-Man",
          },
        },
      })
      .expectStackCreateSuccess({
        stackName: "many-params",
        stackPath: "/many-params.yml/eu-north-1",
        expectDeployedStack: {
          outputs: {
            One: "a",
            Two: "b",
            Three: "c",
          },
        },
      })
      .assert())
})
