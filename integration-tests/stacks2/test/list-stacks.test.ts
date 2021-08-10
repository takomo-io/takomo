import {
  executeDeployStacksCommand,
  executeListStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"
import { isDefined, isNumber } from "@takomo/test-unit"
import { cliExecutors } from "./helpers"

const projectDir = "configs/resolvers/stack-output-with-confidential"

const {
  executeWithCliAndExpectSuccessAsJson,
  executeWithCliAndExpectSuccessAsYaml,
} = cliExecutors("stacks list")

describe("List stacks", () => {
  test("List all stacks before deploy", () =>
    executeListStacksCommand({ projectDir })
      .expectOutputToBeSuccessful()
      .expectStack({
        stackPath: "/vpc.yml/eu-west-1",
        stackName: "vpc",
        status: undefined,
      })
      .expectStack({
        stackPath: "/security-groups.yml/eu-west-1",
        stackName: "security-groups",
        status: undefined,
      })
      .assert())

  test(
    "List all stacks before deploy with cli",
    withSingleAccountReservation(async ({ accountId, credentials }) => {
      const expected = {
        status: "SUCCESS",
        success: true,
        message: "Success",
        time: isNumber,
        stacks: [
          {
            path: "/security-groups.yml/eu-west-1",
            name: "security-groups",
            status: undefined,
            createdTime: undefined,
          },
          {
            path: "/vpc.yml/eu-west-1",
            name: "vpc",
            status: undefined,
            createdTime: undefined,
          },
        ],
      }
      await executeWithCliAndExpectSuccessAsJson({
        command: `--output json --quiet -d ${projectDir} --var ACCOUNT_1_ID=${accountId}`,
        expected,
        credentials,
      })
      await executeWithCliAndExpectSuccessAsYaml({
        command: `--output yaml --quiet -d ${projectDir} --var ACCOUNT_1_ID=${accountId}`,
        expected,
        credentials,
      })
    }),
  )

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
        time: isNumber,
        stacks: [
          {
            path: "/security-groups.yml/eu-west-1",
            name: "security-groups",
            status: "CREATE_COMPLETE",
            createdTime: isDefined,
          },
          {
            path: "/vpc.yml/eu-west-1",
            name: "vpc",
            status: "CREATE_COMPLETE",
            createdTime: isDefined,
          },
        ],
      }
      await executeWithCliAndExpectSuccessAsJson({
        command: `--output json --quiet -d ${projectDir} --var ACCOUNT_1_ID=${accountId}`,
        expected,
        credentials,
      })
      await executeWithCliAndExpectSuccessAsYaml({
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

  test(
    "List all stacks by path with cli",
    withSingleAccountReservation(async ({ accountId, credentials }) => {
      const expected = {
        status: "SUCCESS",
        success: true,
        message: "Success",
        time: isNumber,
        stacks: [
          {
            path: "/security-groups.yml/eu-west-1",
            name: "security-groups",
            status: "CREATE_COMPLETE",
            createdTime: isDefined,
          },
        ],
      }
      await executeWithCliAndExpectSuccessAsJson({
        command: `/security-groups.yml --output json --quiet -d ${projectDir} --var ACCOUNT_1_ID=${accountId}`,
        expected,
        credentials,
      })
      await executeWithCliAndExpectSuccessAsYaml({
        command: `/security-groups.yml --output yaml --quiet -d ${projectDir} --var ACCOUNT_1_ID=${accountId}`,
        expected,
        credentials,
      })
    }),
  )
})
