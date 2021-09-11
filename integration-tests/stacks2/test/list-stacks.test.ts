import {
  executeDeployStacksCommand,
  executeListStacksCommand,
  executeWithCli,
} from "@takomo/test-integration"
import { isDefined, isNumber } from "@takomo/test-unit"

const projectDir = "configs/list-stacks"

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
      .assert())

  test("List all stacks before deploy with cli", async () => {
    const expected = {
      status: "SUCCESS",
      success: true,
      message: "Success",
      time: isNumber,
      results: [
        {
          path: "/security-groups1.yml/eu-west-1",
          name: "security-groups1",
        },
        {
          path: "/vpc1.yml/eu-west-1",
          name: "vpc1",
        },
      ],
    }

    await executeWithCli(
      `./bin/tkm stacks list --output json --quiet -d ${projectDir}`,
    )
      .expectJson(expected)
      .assert()

    await executeWithCli(
      `./bin/tkm stacks list --output yaml --quiet -d ${projectDir}`,
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
      .assert())

  test("List all stacks with cli", async () => {
    const expected = {
      status: "SUCCESS",
      success: true,
      message: "Success",
      time: isNumber,
      results: [
        {
          path: "/security-groups1.yml/eu-west-1",
          name: "security-groups1",
          status: "CREATE_COMPLETE",
          createdTime: isDefined,
        },
        {
          path: "/vpc1.yml/eu-west-1",
          name: "vpc1",
          status: "CREATE_COMPLETE",
          createdTime: isDefined,
        },
      ],
    }

    await executeWithCli(
      `./bin/tkm stacks list --output json --quiet -d ${projectDir}`,
    )
      .expectJson(expected)
      .assert()

    await executeWithCli(
      `./bin/tkm stacks list --output yaml --quiet -d ${projectDir}`,
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
          name: "security-groups1",
          status: "CREATE_COMPLETE",
          createdTime: isDefined,
        },
      ],
    }

    await executeWithCli(
      `./bin/tkm stacks list /security-groups1.yml --output json --quiet -d ${projectDir}`,
    )
      .expectJson(expected)
      .assert()

    await executeWithCli(
      `./bin/tkm stacks list /security-groups1.yml --output yaml --quiet -d ${projectDir}`,
    )
      .expectYaml(expected)
      .assert()
  })
})
