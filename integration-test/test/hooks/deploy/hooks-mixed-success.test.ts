import { executeDeployStacksCommand } from "../../../src/commands/stacks.js"

describe("Successful hooks", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: `${process.cwd()}/integration-test/configs/hooks`,
      commandPath: "/deploy/mixed/success",
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/deploy/mixed/success/stack-1.yml/eu-west-1",
        stackName: "examples-hooks-deploy-mixed-success-stack-1",
      })
      .expectStackCreateSuccess({
        stackPath: "/deploy/mixed/success/stack-2.yml/eu-west-1",
        stackName: "examples-hooks-deploy-mixed-success-stack-2",
      })
      .assert())
})
