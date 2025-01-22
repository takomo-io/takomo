import { mock } from "jest-mock-extended"
import { dedent } from "ts-dedent"
import {
  CloudFormationStackSummary,
  StackDriftDetectionStatusOutput,
} from "../../../../src/aws/cloudformation/model.js"
import { createDetectDriftIO } from "../../../../src/cli-io/stacks/detect-drift-io.js"
import { StackDriftInfo } from "../../../../src/command/stacks/drift/model.js"
import { green, red } from "../../../../src/utils/colors.js"
import {
  createConsoleLogger,
  LogWriter,
} from "../../../../src/utils/logging.js"
import { Timer } from "../../../../src/utils/timer.js"
import { createCapturingLogWriter } from "../../../capturing-log-writer.js"
import { mockInternalStack } from "../../mocks.js"

const createIO = (writer: LogWriter) =>
  createDetectDriftIO({
    writer,
    logger: createConsoleLogger({ logLevel: "info" }),
  })

const printOutput = (...stacks: ReadonlyArray<StackDriftInfo>): string => {
  const logOutput = { value: "" }
  const io = createIO(createCapturingLogWriter(logOutput))
  const timer = mock<Timer>({ getFormattedTimeElapsed: () => "1ms" })

  io.printOutput({
    stacks,
    message: "Success",
    status: "SUCCESS",
    timer,
    success: true,
    outputFormat: "text",
  })

  return logOutput.value
}

describe("DetectDriftIO#printOutput", () => {
  test("single stack", () => {
    const output = printOutput({
      stack: mockInternalStack({
        name: "a",
        path: "/a.yml/eu-north-1",
        region: "eu-north-1",
      }),
      current: mock<CloudFormationStackSummary>({ status: "CREATE_COMPLETE" }),
      driftDetectionStatus: mock<StackDriftDetectionStatusOutput>({
        stackDriftStatus: "IN_SYNC",
        driftedStackResourceCount: 0,
      }),
    })

    const expected = dedent`
    
    Path               Name  Status           Drift status  Drifted resources
    -----------------  ----  ---------------  ------------  -----------------
    /a.yml/eu-north-1  a     ${green("CREATE_COMPLETE")}  ${green(
      "IN_SYNC",
    )}       0                
    
    
    `

    expect(output).toBe(expected)
  })

  test("two stacks", () => {
    const output = printOutput(
      {
        stack: mockInternalStack({
          name: "b",
          path: "/b.yml/eu-central-1",
          region: "eu-central-1",
        }),
        current: mock<CloudFormationStackSummary>({
          status: "UPDATE_COMPLETE",
        }),
        driftDetectionStatus: mock<StackDriftDetectionStatusOutput>({
          stackDriftStatus: "DRIFTED",
          driftedStackResourceCount: 1,
        }),
      },
      {
        stack: mockInternalStack({
          name: "a",
          path: "/a.yml/eu-north-1",
          region: "eu-north-1",
        }),
        current: mock<CloudFormationStackSummary>({
          status: "DELETE_FAILED",
        }),
        driftDetectionStatus: mock<StackDriftDetectionStatusOutput>({
          stackDriftStatus: "DRIFTED",
          driftedStackResourceCount: 2,
        }),
      },
    )

    const expected = dedent`

    Path                 Name  Status           Drift status  Drifted resources
    -------------------  ----  ---------------  ------------  -----------------
    /b.yml/eu-central-1  b     ${green("UPDATE_COMPLETE")}  ${red(
      "DRIFTED",
    )}       1                
    /a.yml/eu-north-1    a     ${red("DELETE_FAILED")}    ${red(
      "DRIFTED",
    )}       2                
    
    
    `

    expect(output).toBe(expected)
  })
})
