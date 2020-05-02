import { Options, TakomoCredentialProvider, Variables } from "@takomo/core"
import { ConsoleLogger, Logger, LogLevel, TemplateEngine } from "@takomo/util"
import { CommandContext } from "../../src/context"
import { executeHooks } from "../../src/hook"
import { Hook, HookExecutor, HookInput, HookOutput } from "../../src/hook/model"
import { Stack, StackOperationVariables } from "../../src/model"
import { mockTakomoCredentialProvider } from "../mocks"

class MockHook implements Hook {
  private readonly value: any | null
  private readonly success: boolean

  executed = false

  constructor(success = true, value: any = null) {
    this.success = success
    this.value = value
  }

  async execute(input: HookInput): Promise<HookOutput> {
    this.executed = true
    return {
      success: this.success,
      message: "",
      value: this.value,
    }
  }
}

class FailingMockHook implements Hook {
  private readonly error: Error

  executed = false

  constructor(error: Error) {
    this.error = error
  }

  async execute(input: HookInput): Promise<HookOutput> {
    this.executed = true
    throw this.error
  }
}

const ctx: CommandContext = {
  getCredentialProvider: (): TakomoCredentialProvider =>
    mockTakomoCredentialProvider(),
  getStacksToProcess: (): Stack[] => [],
  getLogger: (): Logger => new ConsoleLogger(),
  getStacksByPath: (path: string): Stack[] => [],
  getTemplateEngine: (): TemplateEngine => new TemplateEngine(),
  getVariables: (): Variables => ({
    context: { projectDir: "" },
    env: {},
    var: {},
  }),
  getOptions: (): Options =>
    new Options({
      projectDir: "",
      autoConfirm: false,
      logConfidentialInfo: false,
      logLevel: LogLevel.INFO,
      stats: false,
    }),
}

const createVariables = (): StackOperationVariables => ({
  context: { projectDir: "" },
  env: {},
  var: {},
  hooks: {},
})

const logger = new ConsoleLogger()

describe("#executeHooks", () => {
  describe("when no hooks are given", () => {
    it("returns success", async () => {
      const result = await executeHooks(
        ctx,
        createVariables(),
        [],
        "create",
        "before",
        logger,
      )
      expect(result).toStrictEqual({
        success: true,
        message: "Success",
      })
    })
  })

  describe("when a single hook that executes successfully is given", () => {
    it("returns success", async () => {
      const hook1 = new MockHook()
      const hook1Executor = new HookExecutor(
        {
          operation: null,
          status: null,
          stage: null,
          name: "mock1",
          type: "cmd",
        },
        hook1,
      )

      const result = await executeHooks(
        ctx,
        createVariables(),
        [hook1Executor],
        "create",
        "before",
        logger,
      )
      expect(result).toStrictEqual({
        success: true,
        message: "Success",
      })

      expect(hook1.executed).toBeTruthy()
    })
  })

  describe("when a single hook that throws an exception is given", () => {
    it("returns error", async () => {
      const hook1 = new FailingMockHook(new Error("Error error!"))

      const hook1Executor = new HookExecutor(
        {
          operation: null,
          status: null,
          stage: null,
          name: "mock1",
          type: "cmd",
        },
        hook1,
      )

      const result = await executeHooks(
        ctx,
        createVariables(),
        [hook1Executor],
        "create",
        "before",
        logger,
      )
      expect(result).toStrictEqual({
        success: false,
        message: "Error error!",
      })

      expect(hook1.executed).toBe(true)
    })
  })

  describe("when multiple hooks are given", () => {
    it("executes only the hooks that match with the given operation, stage and status", async () => {
      const hook1 = new MockHook()

      const hook1Executor = new HookExecutor(
        {
          operation: ["create"],
          status: null,
          stage: ["before"],
          name: "mock1",
          type: "cmd",
        },
        hook1,
      )

      const hook2 = new MockHook()

      const hook2Executor = new HookExecutor(
        {
          operation: ["delete"],
          status: null,
          stage: ["after"],
          name: "mock2",
          type: "cmd",
        },
        hook2,
      )

      const hook3 = new MockHook()

      const hook3Executor = new HookExecutor(
        {
          operation: null,
          status: null,
          stage: null,
          name: "mock3",
          type: "cmd",
        },
        hook3,
      )

      const result = await executeHooks(
        ctx,
        createVariables(),
        [hook1Executor, hook2Executor, hook3Executor],
        "delete",
        "after",
        logger,
      )

      expect(result).toStrictEqual({
        success: true,
        message: "Success",
      })

      expect(hook1.executed).toBeFalsy()
      expect(hook2.executed).toBeTruthy()
      expect(hook3.executed).toBeTruthy()
    })
  })

  describe("when a hook fails", () => {
    it("the remaining hooks are not executed", async () => {
      const hook1 = new MockHook(true, "A")
      const hook2 = new MockHook(false, "B")
      const hook3 = new MockHook(true, "C")
      const hook4 = new MockHook(true, "D")

      const hook1Executor = new HookExecutor(
        {
          operation: null,
          status: null,
          stage: null,
          name: "mock1",
          type: "cmd",
        },
        hook1,
      )

      const hook2Executor = new HookExecutor(
        {
          operation: null,
          status: null,
          stage: null,
          name: "mock2",
          type: "cmd",
        },
        hook2,
      )

      const hook3Executor = new HookExecutor(
        {
          operation: null,
          status: null,
          stage: null,
          name: "mock3",
          type: "cmd",
        },
        hook3,
      )

      const hook4Executor = new HookExecutor(
        {
          operation: null,
          status: null,
          stage: null,
          name: "mock4",
          type: "cmd",
        },
        hook4,
      )

      const variables = createVariables()

      const result = await executeHooks(
        ctx,
        variables,
        [hook1Executor, hook2Executor, hook3Executor, hook4Executor],
        "delete",
        "after",
        logger,
      )

      expect(result.success).toBeFalsy()
      expect(hook1.executed).toBeTruthy()
      expect(hook2.executed).toBeTruthy()
      expect(hook3.executed).toBeFalsy()
      expect(hook4.executed).toBeFalsy()

      expect(variables.hooks).toStrictEqual({
        mock1: "A",
        mock2: "B",
      })
    })
  })
})
