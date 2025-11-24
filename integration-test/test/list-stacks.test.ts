import { isDefined, isNumber } from "../src/assertions.js"
import { executeWithCli } from "../src/cli/execute.js"
import {
  executeDeployStacksCommand,
  executeListStacksCommand,
} from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/list-stacks`

describe("List stacks", () => {
  test("List all stacks before deploy", () =>
    executeListStacksCommand({ projectDir })
      .expectOutputToBeSuccessful()
      .expectStack({
        stackPath: "/vpc1.yml/eu-west-1",
        stackName: "vpc1",
        status: undefined,
      })
      .expectStack({
        stackPath: "/security-groups1.yml/eu-west-1",
        stackName: "security-groups1",
        status: undefined,
      })
      .expectStack({
        stackPath: "/my-custom.yml/eu-west-1",
        stackName: "my-custom",
        status: "CREATE_COMPLETE",
      })
      .assert())

  test("List all stacks before deploy with cli", async () => {
    const expected = {
      status: "SUCCESS",
      success: true,
      message: "Success",
      time: isNumber,
      results: [
        {
          path: "/my-custom.yml/eu-west-1",
          name: "my-custom",
          type: "custom",
          status: "CREATE_COMPLETE",
        },
        {
          path: "/security-groups1.yml/eu-west-1",
          name: "security-groups1",
          type: "standard",
        },
        {
          path: "/vpc1.yml/eu-west-1",
          name: "vpc1",
          type: "standard",
        },
      ],
    }

    await executeWithCli(
      `node bin/tkm.mjs stacks list --output json --quiet -d ${projectDir}`,
    )
      .expectJson(expected)
      .assert()

    await executeWithCli(
      `node bin/tkm.mjs stacks list --output yaml --quiet -d ${projectDir}`,
    )
      .expectYaml(expected)
      .assert()
  })

  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/security-groups1.yml/eu-west-1",
        stackName: "security-groups1",
      })
      .expectStackCreateSuccess({
        stackPath: "/vpc1.yml/eu-west-1",
        stackName: "vpc1",
      })
      .expectStackUpdateSuccessWithNoChanges({
        stackPath: "/my-custom.yml/eu-west-1",
        stackName: "my-custom",
      })
      .assert())

  test("List all stacks", () =>
    executeListStacksCommand({ projectDir })
      .expectOutputToBeSuccessful()
      .expectStack({
        stackPath: "/vpc1.yml/eu-west-1",
        stackName: "vpc1",
        status: "CREATE_COMPLETE",
      })
      .expectStack({
        stackPath: "/security-groups1.yml/eu-west-1",
        stackName: "security-groups1",
        status: "CREATE_COMPLETE",
      })
      .expectStack({
        stackPath: "/my-custom.yml/eu-west-1",
        stackName: "my-custom",
        status: "CREATE_COMPLETE",
      })

      .assert())

  test("List all stacks with cli", async () => {
    const expected = {
      status: "SUCCESS",
      success: true,
      message: "Success",
      time: isNumber,
      results: [
        {
          path: "/my-custom.yml/eu-west-1",
          name: "my-custom",
          type: "custom",
          status: "CREATE_COMPLETE",
        },
        {
          path: "/security-groups1.yml/eu-west-1",
          type: "standard",
          name: "security-groups1",
          status: "CREATE_COMPLETE",
          createdTime: isDefined,
        },
        {
          path: "/vpc1.yml/eu-west-1",
          type: "standard",
          name: "vpc1",
          status: "CREATE_COMPLETE",
          createdTime: isDefined,
        },
      ],
    }

    await executeWithCli(
      `node bin/tkm.mjs stacks list --output json --quiet -d ${projectDir}`,
    )
      .expectJson(expected)
      .assert()

    await executeWithCli(
      `node bin/tkm.mjs stacks list --output yaml --quiet -d ${projectDir}`,
    )
      .expectYaml(expected)
      .assert()
  })

  test("List stacks by path", () =>
    executeListStacksCommand({
      projectDir,
      commandPath: "/security-groups1.yml",
    })
      .expectOutputToBeSuccessful()
      .expectStack({
        stackPath: "/security-groups1.yml/eu-west-1",
        stackName: "security-groups1",
        status: "CREATE_COMPLETE",
      })
      .assert())

  test("List all stacks by path with cli", async () => {
    const expected = {
      status: "SUCCESS",
      success: true,
      message: "Success",
      time: isNumber,
      results: [
        {
          path: "/security-groups1.yml/eu-west-1",
          type: "standard",
          name: "security-groups1",
          status: "CREATE_COMPLETE",
          createdTime: isDefined,
        },
      ],
    }

    await executeWithCli(
      `node bin/tkm.mjs stacks list /security-groups1.yml --output json --quiet -d ${projectDir}`,
    )
      .expectJson(expected)
      .assert()

    await executeWithCli(
      `node bin/tkm.mjs stacks list /security-groups1.yml --output yaml --quiet -d ${projectDir}`,
    )
      .expectYaml(expected)
      .assert()
  })
})
