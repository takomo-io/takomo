import dedent from "ts-dedent"
import { createListStacksIO } from "../../../../src/takomo-cli-io"
import { formatDate } from "../../../../src/takomo-cli-io/stacks/common"
import {
  createConsoleLogger,
  createTimer,
  green,
  LogWriter,
} from "../../../../src/takomo-util"
import { createCapturingLogWriter } from "../../../capturing-log-writer"

const createIO = (writer: LogWriter) =>
  createListStacksIO({
    writer,
    logger: createConsoleLogger({ logLevel: "info" }),
  })

describe("ListStacksIO#printOutput", () => {
  test("single stack", () => {
    const now = new Date()
    const output = { value: "" }
    const io = createIO(createCapturingLogWriter(output))
    io.printOutput({
      results: [
        {
          name: "stackA",
          path: "/stackA.yml/eu-west-1",
          status: "CREATE_COMPLETE",
          createdTime: now,
          updatedTime: now,
        },
      ],
      message: "Success",
      status: "SUCCESS",
      timer: createTimer("total"),
      success: true,
      outputFormat: "text",
    })

    const expected = dedent`
    
    Path                   Name    Status           Created                    Updated                  
    ---------------------  ------  ---------------  -------------------------  -------------------------
    /stackA.yml/eu-west-1  stackA  ${green("CREATE_COMPLETE")}  ${formatDate(
      now,
    )}  ${formatDate(now)}
    
    
    `

    expect(output.value).toBe(expected)
  })
})
