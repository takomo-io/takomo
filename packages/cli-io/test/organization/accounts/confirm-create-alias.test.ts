import { Options } from "@takomo/core/src"
import { CapturingLogWriter } from "@takomo/unit-test"
import { LogLevel, LogWriter } from "@takomo/util"
import { CliCreateAliasIO } from "../../../src/organization"

const options = new Options({
  autoConfirm: false,
  logConfidentialInfo: false,
  stats: false,
  logLevel: LogLevel.INFO,
  projectDir: "",
})

class TestCliCreateAliasIO extends CliCreateAliasIO {
  constructor(options: Options, logWriter: LogWriter) {
    super(options, logWriter)
  }

  confirm = async (message: string, marginTop = false): Promise<boolean> => {
    if (marginTop) {
      this.print()
    }
    this.print(message)
    return true
  }
}

describe("CliCreateAliasIO#confirmCreateAlias", () => {
  test("should print correct output", async () => {
    const capturing = new CapturingLogWriter()
    const io = new TestCliCreateAliasIO(options, capturing.write)
    await io.confirmCreateAlias("123456789012", "myAlias")
    expect(capturing.output).toBe(
      "\nContinue to create alias 'myAlias' to account 123456789012?\n",
    )
  })
})
