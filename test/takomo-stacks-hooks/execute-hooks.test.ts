import { mock } from "jest-mock-extended"
import { executeHooks } from "../../src/takomo-stacks-hooks"
import {
  Hook,
  HookExecutor,
  HookInput,
  HookOutput,
  HooksExecutionOutput,
  InternalStacksContext,
  Stack,
  StackOperationVariables,
} from "../../src/takomo-stacks-model"
import { createConsoleLogger } from "../../src/utils/logging"

class ThrowingHook implements Hook {
  private readonly error: Error

  executed = false

  constructor(error: Error) {
    this.error = error
  }

  execute = async (): Promise<HookOutput> => {
    this.executed = true
    throw this.error
  }
}

class TestHook implements Hook {
  private readonly output: HookOutput
  executed = false

  constructor(output: HookOutput) {
    this.output = output
  }

  execute = async (): Promise<HookOutput> => {
    this.executed = true
    return this.output
  }
}

class SkipHook implements Hook {
  executed = false

  execute = async (): Promise<HookOutput> => {
    this.executed = true
    return {
      skip: true,
      success: true,
    }
  }
}

class HandlerHook implements Hook {
  private readonly handler: (input: HookInput) => Promise<HookOutput>
  executed = false

  constructor(handler: (input: HookInput) => Promise<HookOutput>) {
    this.handler = handler
  }

  execute = async (input: HookInput): Promise<HookOutput> => {
    this.executed = true
    return this.handler(input)
  }
}

const ctx: InternalStacksContext = mock<InternalStacksContext>()

const createVariables = (): StackOperationVariables => ({
  context: { projectDir: "" },
  env: {},
  var: {},
  hooks: {},
})

const logger = createConsoleLogger({
  logLevel: "info",
})

const executor = (name: string, hook: Hook): HookExecutor =>
  new HookExecutor(
    {
      name,
      type: "cmd",
    },
    hook,
  )

const stack = mock<Stack>()

const executeAllHooks = async (
  variables: StackOperationVariables,
  ...executors: HookExecutor[]
): Promise<HooksExecutionOutput> =>
  executeHooks({
    ctx,
    stack,
    variables,
    logger,
    hooks: executors,
    operation: "create",
    stage: "before",
  })

describe("#executeHooks", () => {
  describe("when no hooks are given", () => {
    test("returns success", async () => {
      const result = await executeHooks({
        ctx,
        stack,
        logger,
        variables: createVariables(),
        hooks: [],
        operation: "create",
        stage: "before",
      })
      expect(result).toStrictEqual({
        result: "continue",
        message: "Success",
      })
    })
  })

  describe("when a single hook that executes successfully is given", () => {
    test("returns success", async () => {
      const hook1 = new TestHook(true)
      const hook1Executor = new HookExecutor(
        {
          name: "mock1",
          type: "cmd",
        },
        hook1,
      )

      const result = await executeHooks({
        ctx,
        stack,
        logger,
        variables: createVariables(),
        hooks: [hook1Executor],
        operation: "create",
        stage: "before",
      })
      expect(result).toStrictEqual({
        result: "continue",
        message: "Success",
      })

      expect(hook1.executed).toBeTruthy()
    })
  })

  describe("when a single hook that throws an exception is given", () => {
    test("returns error", async () => {
      const hook1 = new ThrowingHook(new Error("Error error!"))

      const hook1Executor = new HookExecutor(
        {
          name: "mock1",
          type: "cmd",
        },
        hook1,
      )

      const result = await executeHooks({
        ctx,
        stack,
        logger,
        variables: createVariables(),
        hooks: [hook1Executor],
        operation: "create",
        stage: "before",
      })
      expect(result).toStrictEqual({
        result: "abort",
        message: "Error error!",
        error: undefined,
      })

      expect(hook1.executed).toBe(true)
    })
  })

  describe("when multiple hooks are given", () => {
    test("executes only the hooks that match with the given operation, stage and status", async () => {
      const hook1 = new TestHook(true)

      const hook1Executor = new HookExecutor(
        {
          operation: ["create"],
          stage: ["before"],
          name: "mock1",
          type: "cmd",
        },
        hook1,
      )

      const hook2 = new TestHook(true)

      const hook2Executor = new HookExecutor(
        {
          operation: ["delete"],
          stage: ["after"],
          name: "mock2",
          type: "cmd",
        },
        hook2,
      )

      const hook3 = new TestHook(true)

      const hook3Executor = new HookExecutor(
        {
          name: "mock3",
          type: "cmd",
        },
        hook3,
      )

      const result = await executeHooks({
        ctx,
        stack,
        logger,
        variables: createVariables(),
        hooks: [hook1Executor, hook2Executor, hook3Executor],
        operation: "delete",
        stage: "after",
      })

      expect(result).toStrictEqual({
        result: "continue",
        message: "Success",
      })

      expect(hook1.executed).toBeFalsy()
      expect(hook2.executed).toBeTruthy()
      expect(hook3.executed).toBeTruthy()
    })
  })

  describe("when a hook fails", () => {
    test("the remaining hooks are not executed", async () => {
      const hook1 = new TestHook({ success: true, value: "A" })
      const hook2 = new TestHook({ success: false, value: "B" })
      const hook3 = new TestHook({ success: true, value: "C" })
      const hook4 = new TestHook({ success: true, value: "D" })

      const hook1Executor = new HookExecutor(
        {
          name: "mock1",
          type: "cmd",
        },
        hook1,
      )

      const hook2Executor = new HookExecutor(
        {
          name: "mock2",
          type: "cmd",
        },
        hook2,
      )

      const hook3Executor = new HookExecutor(
        {
          name: "mock3",
          type: "cmd",
        },
        hook3,
      )

      const hook4Executor = new HookExecutor(
        {
          name: "mock4",
          type: "cmd",
        },
        hook4,
      )

      const variables = createVariables()

      const result = await executeHooks({
        ctx,
        stack,
        variables,
        hooks: [hook1Executor, hook2Executor, hook3Executor, hook4Executor],
        operation: "delete",
        stage: "after",
        logger,
      })

      expect(result.result).toStrictEqual("abort")
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

  describe("when a hook returns skip", () => {
    test("the remaining hooks are not executed", async () => {
      const hook1 = new TestHook({ success: true, value: "A" })
      const hook2 = new SkipHook()
      const hook3 = new TestHook({ success: true, value: "C" })
      const hook4 = new TestHook({ success: true, value: "D" })

      const hook1Executor = new HookExecutor(
        {
          name: "mock1",
          type: "cmd",
        },
        hook1,
      )

      const hook2Executor = new HookExecutor(
        {
          name: "mock2",
          type: "cmd",
        },
        hook2,
      )

      const hook3Executor = new HookExecutor(
        {
          name: "mock3",
          type: "cmd",
        },
        hook3,
      )

      const hook4Executor = new HookExecutor(
        {
          name: "mock4",
          type: "cmd",
        },
        hook4,
      )

      const variables = createVariables()

      const result = await executeHooks({
        ctx,
        stack,
        variables,
        hooks: [hook1Executor, hook2Executor, hook3Executor, hook4Executor],
        operation: "create",
        stage: "before",
        logger,
      })

      expect(result.result).toStrictEqual("skip")
      expect(hook1.executed).toBeTruthy()
      expect(hook2.executed).toBeTruthy()
      expect(hook3.executed).toBeFalsy()
      expect(hook4.executed).toBeFalsy()

      expect(variables.hooks).toStrictEqual({
        mock1: "A",
        mock2: undefined,
      })
    })
  })

  describe("returned value should be correct", () => {
    test("when a hook returns primitive false", async () => {
      const hook = new TestHook(false)
      const variables = createVariables()

      const result = await executeAllHooks(variables, executor("hook1", hook))

      expect(result.result).toStrictEqual("abort")
      expect(result.message).toBe("Failed")
      expect(variables.hooks["hook1"]).toBe(false)
    })

    test("when a hook returns primitive true", async () => {
      const hook = new TestHook(true)
      const variables = createVariables()

      const result = await executeAllHooks(variables, executor("hook2", hook))

      expect(result.result).toStrictEqual("continue")
      expect(result.message).toBe("Success")
      expect(variables.hooks["hook2"]).toBe(true)
    })

    test("when a hook returns an error object", async () => {
      const err = new Error("My error")
      const hook = new TestHook(err)
      const variables = createVariables()

      const result = await executeAllHooks(variables, executor("hook3", hook))

      expect(result.result).toStrictEqual("abort")
      expect(result.message).toBe("My error")
      expect(variables.hooks["hook3"]).toBe(err)
    })

    test("when a hook returns an output object", async () => {
      const hook = new TestHook({ success: true, value: "X", message: "OK" })
      const variables = createVariables()

      const result = await executeAllHooks(variables, executor("hook4", hook))

      expect(result.result).toStrictEqual("continue")
      expect(result.message).toBe("Success")
      expect(variables.hooks["hook4"]).toBe("X")
    })
  })

  describe("when multiple hooks are executed", () => {
    test("subsequent hooks should be able to see output values of prior hooks", async () => {
      const hook1 = new TestHook({ success: true, value: "Hello XXXX!" })
      const hook2 = new TestHook({ success: true, value: "Frodo" })
      const hook3 = new HandlerHook((input: HookInput): Promise<HookOutput> => {
        const greeting = input.variables.hooks["hook1"]
        const name = input.variables.hooks["hook2"]
        const value = greeting.replace("XXXX", name)
        return Promise.resolve({ success: true, value })
      })

      const variables = createVariables()

      await executeAllHooks(
        variables,
        executor("hook1", hook1),
        executor("hook2", hook2),
        executor("hook3", hook3),
      )

      expect(variables.hooks["hook3"]).toBe("Hello Frodo!")
    })
  })
})
