import { executeDeployStacksCommand } from "../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/invalid-parameters`

describe("Invalid parameters", () => {
  test("An extra parameter in config file fails the parameter validation", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/extra-parameter-in-config.yml",
    })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        stackPath: "/extra-parameter-in-config.yml/eu-north-1",
        stackName: "extra-parameter-in-config",
        errorMessage:
          "Parameter 'Code' is defined in the stack configuration but not found from the template",
      })
      .assert())

  test("A missing parameter in config file fails the parameter validation", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/missing-parameter-in-config.yml",
    })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        stackPath: "/missing-parameter-in-config.yml/eu-north-1",
        stackName: "missing-parameter-in-config",
        errorMessage:
          "Parameter 'Third' is defined in the template but not found from the stack configuration",
      })
      .assert())
})
