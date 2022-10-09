import { executeDeployStacksCommand } from "../../../src/commands/stacks"

describe("After hook that skips", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: `${process.cwd()}/integration-test/configs/hooks`,
      commandPath: "/deploy/after/skip",
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/deploy/after/skip/stack-1.yml/eu-west-1",
        stackName: "examples-hooks-deploy-after-skip-stack-1",
      })
      .expectStackCreateSuccess({
        stackPath: "/deploy/after/skip/stack-2.yml/eu-west-1",
        stackName: "examples-hooks-deploy-after-skip-stack-2",
      })
      .expectStackCreateSuccess({
        stackPath: "/deploy/after/skip/stack-3.yml/eu-west-1",
        stackName: "examples-hooks-deploy-after-skip-stack-3",
      })
      .assert())
})
