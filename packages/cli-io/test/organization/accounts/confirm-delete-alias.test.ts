import { Options } from "@takomo/core/src"
import { CapturingLogWriter } from "@takomo/unit-test"
import { LogLevel, LogWriter } from "@takomo/util"
import { CliDeleteAliasIO } from "../../../src/organization"

const options = new Options({
  autoConfirm: false,
  logConfidentialInfo: false,
  stats: false,
  logLevel: LogLevel.INFO,
  projectDir: "",
})

class TestCliDeleteAliasIO extends CliDeleteAliasIO {
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

describe("CliDeleteAliasIO#confirmDeleteAlias", () => {
  test("should print correct output", async () => {
    const capturing = new CapturingLogWriter()
    const io = new TestCliDeleteAliasIO(options, capturing.write)
    await io.confirmDeleteAlias("210987654321")
    expect(capturing.output).toBe(
      "\nContinue to delete alias from account 210987654321?\n",
    )
  })
})
