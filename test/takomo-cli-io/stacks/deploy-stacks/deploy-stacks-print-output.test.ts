import { mock } from "jest-mock-extended"
import dedent from "ts-dedent"
import { createDeployStacksIO } from "../../../../src/takomo-cli-io"
import { InternalStack, StackResult } from "../../../../src/takomo-stacks-model"
import {
  createConsoleLogger,
  green,
  LogWriter,
  Timer,
} from "../../../../src/takomo-util"
import { createCapturingLogWriter } from "../../../capturing-log-writer"
import { mockInternalStack } from "../../mocks"

const createIO = (writer: LogWriter) =>
  createDeployStacksIO({
    writer,
    logger: createConsoleLogger({ logLevel: "info" }),
  })

const printOutput = (...stacks: ReadonlyArray<InternalStack>): string => {
  const logOutput = { value: "" }
  const io = createIO(createCapturingLogWriter(logOutput))
  const timer = mock<Timer>({ getFormattedTimeElapsed: () => "1ms" })
  timer.stop()
  const results: ReadonlyArray<StackResult> = stacks.map((stack) => ({
    stack,
    success: true,
    operationType: "CREATE",
    events: [],
    stackExistedBeforeOperation: false,
    message: "Success",
    status: "SUCCESS",
    timer,
  }))

  io.printOutput({
    results,
    message: "Success",
    status: "SUCCESS",
    timer,
    success: true,
    outputFormat: "text",
  })

  return logOutput.value
}

describe("DeployStacksIO#printOutput", () => {
  test("single stack", () => {
    const output = printOutput(
      mockInternalStack({
        name: "a",
        path: "/a.yml/eu-north-1",
        region: "eu-north-1",
      }),
    )

    const expected = dedent`

    Path               Name  Status   Time  Message
    -----------------  ----  -------  ----  -------
    /a.yml/eu-north-1  a     ${green("SUCCESS")}  1ms   Success

    
    `

    expect(output).toBe(expected)
  })

  test("two stacks", () => {
    const output = printOutput(
      mockInternalStack({
        name: "b",
        path: "/b.yml/eu-central-1",
        region: "eu-central-1",
      }),
      mockInternalStack({
        name: "a",
        path: "/a.yml/eu-north-1",
        region: "eu-north-1",
      }),
    )

    const expected = dedent`

    Path                 Name  Status   Time  Message
    -------------------  ----  -------  ----  -------
    /b.yml/eu-central-1  b     ${green("SUCCESS")}  1ms   Success
    /a.yml/eu-north-1    a     ${green("SUCCESS")}  1ms   Success

    
    `

    expect(output).toBe(expected)
  })
})