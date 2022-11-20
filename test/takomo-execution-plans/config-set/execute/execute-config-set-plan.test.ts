import { mock } from "jest-mock-extended"
import { InternalCredentialManager } from "../../../../src/takomo-aws-clients"
import {
  ConfigSetContext,
  ConfigSetName,
} from "../../../../src/takomo-config-sets"
import { CommandOutput, CommandOutputBase } from "../../../../src/takomo-core"
import {
  ConfigSetPlanExecutionResult,
  ConfigSetTargetExecutionResult,
  ConfigSetTargetListener,
  executeConfigSetPlan,
} from "../../../../src/takomo-execution-plans"
import {
  ConfigSetExecutionPlan,
  ConfigSetTargetExecutor,
  ConfigSetTargetExecutorProps,
  ConfigSetTargetListenerProvider,
} from "../../../../src/takomo-execution-plans/config-set/model"
import { ExecutionTargetId } from "../../../../src/takomo-execution-plans/model"
import { createConsoleLogger } from "../../../../src/utils/logging"
import { Timer } from "../../../../src/utils/timer"

const logger = createConsoleLogger({
  logLevel: "info",
})

const ctx: ConfigSetContext = {
  getStages: () => [],
  getConfigSet: (name: ConfigSetName) => ({
    name,
    description: "",
    vars: {},
    commandPaths: ["/"],
    legacy: false,
  }),
  hasConfigSet: (name: ConfigSetName) => true,
}

const targetListenerProvider: ConfigSetTargetListenerProvider =
  (): ConfigSetTargetListener => ({
    onTargetBegin: async () => {
      logger.info("target begin")
    },
    onTargetComplete: async () => {
      logger.info("target complete")
    },
    onGroupBegin: async (group) => {
      logger.info("group begin")
    },
    onGroupComplete: async (group) => {
      logger.info("group complete")
    },
  })
const defaultCredentialManager = mock<InternalCredentialManager>()

const createExecutor =
  (): ConfigSetTargetExecutor<CommandOutput, string> =>
  async ({
    timer,
  }: ConfigSetTargetExecutorProps<string>): Promise<CommandOutput> => {
    return {
      timer,
      status: "SUCCESS",
      success: true,
      message: "Success",
      outputFormat: "text",
    }
  }

const plan1: ConfigSetExecutionPlan<string> = {
  configSetType: "standard",
  stages: [
    {
      stageName: "one",
      groups: [
        {
          id: "one-1",
          targets: [
            {
              id: "one-1a",
              vars: {},
              data: "one-1a-data",
              configSets: [
                {
                  name: "example",
                  commandPaths: ["/"],
                },
              ],
            },
            {
              id: "one-1b",
              vars: {},
              data: "one-1b-data",
              configSets: [
                {
                  name: "example",
                  commandPaths: ["/"],
                },
              ],
            },
          ],
        },
        {
          id: "one-2",
          targets: [
            {
              id: "one-2a",
              vars: {},
              data: "one-2a-data",
              configSets: [
                {
                  name: "example",
                  commandPaths: ["/"],
                },
              ],
            },
            {
              id: "one-2b",
              vars: {},
              data: "one-2b-data",
              configSets: [
                {
                  name: "example",
                  commandPaths: ["/"],
                },
              ],
            },
            {
              id: "one-2c",
              vars: {},
              data: "one-2c-data",
              configSets: [
                {
                  name: "example",
                  commandPaths: ["/"],
                },
              ],
            },
            {
              id: "one-2d",
              vars: {},
              data: "one-2d-data",
              configSets: [
                {
                  name: "example",
                  commandPaths: ["/"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      stageName: "two",
      groups: [
        {
          id: "two-1",
          targets: [
            {
              id: "two-1a",
              vars: {},
              data: "two-1a-data",
              configSets: [
                {
                  name: "example",
                  commandPaths: ["/"],
                },
              ],
            },
            {
              id: "two-1b",
              vars: {},
              data: "two-1b-data",
              configSets: [
                {
                  name: "example",
                  commandPaths: ["/"],
                },
              ],
            },
          ],
        },
        {
          id: "two-2",
          targets: [
            {
              id: "two-2a",
              vars: {},
              data: "two-2a-data",
              configSets: [
                {
                  name: "example",
                  commandPaths: ["/"],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

describe("Execute config set plan", () => {
  test("empty plan", async () => {
    const result = await executeConfigSetPlan<CommandOutput, string>({
      logger,
      ctx,
      targetListenerProvider,
      defaultCredentialManager,
      timer: new Timer("total"),
      plan: {
        configSetType: "standard",
        stages: [],
      },
      executor: createExecutor(),
      concurrentTargets: 1,
      state: { failed: false },
    })

    expectSuccess(result)
    expect(result.results).toHaveLength(0)
  })

  test("plan with targets", async () => {
    const result = await executeConfigSetPlan<CommandOutput, string>({
      logger,
      ctx,
      targetListenerProvider,
      defaultCredentialManager,
      timer: new Timer("total"),
      plan: plan1,
      executor: createExecutor(),
      concurrentTargets: 1,
      state: { failed: false },
    })

    expectSuccessPlanResult(result)
  })

  test("plan with targets concurrent targets", async () => {
    const result = await executeConfigSetPlan<CommandOutput, string>({
      logger,
      ctx,
      targetListenerProvider,
      defaultCredentialManager,
      timer: new Timer("total"),
      plan: plan1,
      executor: createExecutor(),
      concurrentTargets: 10,
      state: { failed: false },
    })

    expectSuccessPlanResult(result)
  })
})

const expectSuccess = (output: CommandOutputBase): void => {
  expect(output.status).toStrictEqual("SUCCESS")
  expect(output.success).toStrictEqual(true)
  expect(output.message).toStrictEqual("Success")
}

const expectSuccessTargetResult = (
  result: ConfigSetTargetExecutionResult<CommandOutput>,
  targetId: ExecutionTargetId,
): void => {
  expectSuccess(result)
  expect(result.targetId).toStrictEqual(targetId)
  expect(result.results).toHaveLength(1)

  const [configSetResult] = result.results

  expectSuccess(configSetResult)
  expect(configSetResult.results).toHaveLength(1)
  expect(configSetResult.configSetName).toStrictEqual("example")

  const [commandPathResult] = configSetResult.results
  expectSuccess(commandPathResult)
  expect(commandPathResult.commandPath).toStrictEqual("/")
}

const expectSuccessPlanResult = (
  result: ConfigSetPlanExecutionResult<CommandOutput>,
): void => {
  expectSuccess(result)
  expect(result.results).toHaveLength(2)

  const [stageOne, stageTwo] = result.results

  //
  // Stage one
  //
  expectSuccess(stageOne)
  expect(stageOne.stageName).toStrictEqual("one")
  expect(stageOne.results).toHaveLength(2)

  const [groupOne1, groupOne2] = stageOne.results

  // Stage one group 1
  expectSuccess(groupOne1)
  expect(groupOne1.results).toHaveLength(2)

  const [groupOne1a, groupOne1b] = groupOne1.results

  expectSuccessTargetResult(groupOne1a, "one-1a")
  expectSuccessTargetResult(groupOne1b, "one-1b")

  // Stage one group 2
  expectSuccess(groupOne2)
  expect(groupOne2.results).toHaveLength(4)

  const [groupOne2a, groupOne2b, groupOne2c, groupOne2d] = groupOne2.results

  expectSuccessTargetResult(groupOne2a, "one-2a")
  expectSuccessTargetResult(groupOne2b, "one-2b")
  expectSuccessTargetResult(groupOne2c, "one-2c")
  expectSuccessTargetResult(groupOne2d, "one-2d")

  //
  // Stage two
  //
  expectSuccess(stageTwo)
  expect(stageTwo.stageName).toStrictEqual("two")
  expect(stageTwo.results).toHaveLength(2)

  const [groupTwo1, groupTwo2] = stageTwo.results

  // Stage two group 1
  expectSuccess(groupTwo1)
  expect(groupTwo1.results).toHaveLength(2)

  const [groupTwo1a, groupTwo1b] = groupTwo1.results

  expectSuccess(groupTwo1a)
  expectSuccessTargetResult(groupTwo1a, "two-1a")

  expectSuccess(groupTwo1b)
  expectSuccessTargetResult(groupTwo1b, "two-1b")

  // Stage two group 2
  expectSuccess(groupTwo2)
  expect(groupTwo2.results).toHaveLength(1)

  const [groupTwo2a] = groupTwo2.results
  expectSuccessTargetResult(groupTwo2a, "two-2a")
}
