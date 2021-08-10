import {
  executeDeployStacksCommand,
  executeListStacksCommand,
  withSingleAccountReservation,
} from "@takomo/test-integration"
import { isDefined, isNumber } from "@takomo/test-unit"
import { cliExecutors } from "./helpers"

const projectDir = "configs/list-stacks"

const {
  executeWithCliAndExpectSuccessAsJson,
  executeWithCliAndExpectSuccessAsYaml,
} = cliExecutors("stacks list")

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
            path: "/security-groups1.yml/eu-west-1",
            name: "security-groups1",
            status: undefined,
            createdTime: undefined,
          },
          {
            path: "/vpc1.yml/eu-west-1",
            name: "vpc1",
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
      commandPath: "/security-groups1.yml",
    })
      .expectOutputToBeSuccessful()
      .expectStack({
        stackPath: "/security-groups1.yml/eu-west-1",
        stackName: "security-groups1",
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
            path: "/security-groups1.yml/eu-west-1",
            name: "security-groups1",
            status: "CREATE_COMPLETE",
            createdTime: isDefined,
          },
        ],
      }
      await executeWithCliAndExpectSuccessAsJson({
        command: `/security-groups1.yml --output json --quiet -d ${projectDir} --var ACCOUNT_1_ID=${accountId}`,
        expected,
        credentials,
      })
      await executeWithCliAndExpectSuccessAsYaml({
        command: `/security-groups1.yml --output yaml --quiet -d ${projectDir} --var ACCOUNT_1_ID=${accountId}`,
        expected,
        credentials,
      })
    }),
  )
})
