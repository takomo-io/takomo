import { executeDeployStacksCommand } from "../../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/resolvers/file-contents`
const stack = {
  stackPath: "/logs.yml/eu-west-1",
  stackName: "logs",
}

describe("File contents resolver", () => {
  test("Deploy fails if file doesn't exist", () =>
    executeDeployStacksCommand({ projectDir, var: ["file=not-existing"] })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        ...stack,
        errorMessage: `File ${process.cwd()}/integration-test/configs/resolvers/file-contents/not-existing not found`,
      })
      .assert())

  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir, var: ["file=name.txt"] })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(stack)
      .expectDeployedCfStackV2({
        ...stack,
        outputs: {
          Name: "VpcLogs",
        },
      })
      .assert())

  test("Deploy with file from a subdir", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["file=dir/name2.txt"],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccess(stack)
      .expectDeployedCfStackV2({
        ...stack,
        outputs: {
          Name: "Zorro",
        },
      })
      .assert())
})
