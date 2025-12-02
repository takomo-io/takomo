import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/multi-region`

describe("Multi region", () => {
  test("Deploy single stack", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/one.yml/eu-north-1",
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/one.yml/eu-north-1",
        stackName: "one",
      })
      .assert())

  test("Deploy all stacks", () =>
    executeDeployStacksCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges({
        stackPath: "/one.yml/eu-north-1",
        stackName: "one",
      })
      .expectStackCreateSuccess({
        stackPath: "/one.yml/eu-west-1",
        stackName: "one",
      })
      .expectStackCreateSuccess({
        stackPath: "/one.yml/eu-central-1",
        stackName: "one",
      })
      .assert())
})
