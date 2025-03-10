import { dedent } from "ts-dedent"
import { createListStacksIO } from "../../../../src/cli-io/stacks/list-stacks-io.js"
import { formatDate } from "../../../../src/cli-io/stacks/common.js"
import { green } from "../../../../src/utils/colors.js"
import {
  createConsoleLogger,
  LogWriter,
} from "../../../../src/utils/logging.js"
import { Timer } from "../../../../src/utils/timer.js"
import { createCapturingLogWriter } from "../../../capturing-log-writer.js"

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
      timer: new Timer("total"),
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
