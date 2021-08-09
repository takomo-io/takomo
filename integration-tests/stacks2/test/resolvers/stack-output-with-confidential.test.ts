import {
  executeDeployStacksCommand,
  executeListStacksCommand,
  executeUndeployStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"
import { cliExecutors } from "../helpers"

const projectDir = "configs/resolvers/stack-output-with-confidential"

const { executeCliAndExpectSuccessAsJson, executeCliAndExpectSuccessAsYaml } =
  cliExecutors("stacks list")

describe("Stack output resolvers with confidential enabled", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/security-groups.yml/eu-west-1",
        stackName: "security-groups",
      })
      .expectStackCreateSuccess({
        stackPath: "/vpc.yml/eu-west-1",
        stackName: "vpc",
      })
      .assert())

  test("List all stacks", () =>
    executeListStacksCommand({ projectDir })
      .expectOutputToBeSuccessful()
      .expectStack({
        stackPath: "/vpc.yml/eu-west-1",
        stackName: "vpc",
        status: "CREATE_COMPLETE",
      })
      .expectStack({
        stackPath: "/security-groups.yml/eu-west-1",
        stackName: "security-groups",
        status: "CREATE_COMPLETE",
      })
      .assert())

  test(
    "List all stacks with cli",
    withSingleAccountReservation(async ({ accountId, credentials }) => {
      const expected = {
        status: "SUCCESS",
        success: true,
        message: "Success",
        time: (v: unknown) =>
          typeof v === "number" || "Expected to be a number",
        stacks: [
          {
            path: "/security-groups.yml/eu-west-1",
            name: "security-groups",
            status: "CREATE_COMPLETE",
            createdTime: (a: unknown) =>
              a !== undefined || "Expected to be defined",
          },
          {
            path: "/vpc.yml/eu-west-1",
            name: "vpc",
            status: "CREATE_COMPLETE",
            createdTime: (a: unknown) =>
              a !== undefined || "Expected to be defined",
          },
        ],
      }
      await executeCliAndExpectSuccessAsJson({
        command: `--output json --quiet -d ${projectDir} --var ACCOUNT_1_ID=${accountId}`,
        expected,
        credentials,
      })
      await executeCliAndExpectSuccessAsYaml({
        command: `--output yaml --quiet -d ${projectDir} --var ACCOUNT_1_ID=${accountId}`,
        expected,
        credentials,
      })
    }),
  )

  test("List stacks by path", () =>
    executeListStacksCommand({
      projectDir,
      commandPath: "/security-groups.yml",
    })
      .expectOutputToBeSuccessful()
      .expectStack({
        stackPath: "/security-groups.yml/eu-west-1",
        stackName: "security-groups",
        status: "CREATE_COMPLETE",
      })
      .assert())

  test("Deploy with ignore dependencies", () =>
    executeDeployStacksCommand({
      projectDir,
      ignoreDependencies: true,
      commandPath: "/security-groups.yml",
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges({
        stackPath: "/security-groups.yml/eu-west-1",
        stackName: "security-groups",
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackPath: "/security-groups.yml/eu-west-1",
        stackName: "security-groups",
      })
      .expectStackDeleteSuccess({
        stackPath: "/vpc.yml/eu-west-1",
        stackName: "vpc",
      })
      .assert())
})
