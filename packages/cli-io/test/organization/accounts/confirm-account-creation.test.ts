import { Options } from "@takomo/core"
import { CapturingLogWriter } from "@takomo/unit-test"
import { LogLevel, LogWriter } from "@takomo/util"
import dedent from "ts-dedent"
import { CliCreateAccountIO } from "../../../src/organization"

const options = new Options({
  autoConfirm: false,
  logConfidentialInfo: false,
  stats: false,
  logLevel: LogLevel.INFO,
  projectDir: "",
})

class TestCliCreateAccountIO extends CliCreateAccountIO {
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

const expectedOutput = (
  name: string,
  email: string,
  role: string,
  iamAccess: boolean,
  alias: string,
): string => dedent`
  
  Account information:
  
    name:                        ${name}
    email:                       ${email}
    role name:                   ${role}
    iam user access to billing:  ${iamAccess}
    alias:                       ${alias}
  
  Continue to create the account?
  
  `

describe("CliCreateAccountIO#confirmAccountCreation", () => {
  describe("should print correct output", () => {
    test.concurrent("when no alias is given", async () => {
      const capturing = new CapturingLogWriter()
      const io = new TestCliCreateAccountIO(options, capturing.write)

      await io.confirmAccountCreation(
        "my-account",
        "my-account@example.com",
        true,
        "MyAdminRole",
      )

      expect(capturing.output).toEqual(
        expectedOutput(
          "my-account",
          "my-account@example.com",
          "MyAdminRole",
          true,
          "<undefined>",
        ),
      )
    })

    test.concurrent("when alias is given", async () => {
      const capturing = new CapturingLogWriter()
      const io = new TestCliCreateAccountIO(options, capturing.write)

      await io.confirmAccountCreation(
        "hello",
        "bar@foo.com",
        false,
        "Role",
        "secret",
      )

      expect(capturing.output).toEqual(
        expectedOutput("hello", "bar@foo.com", "Role", false, "secret"),
      )
    })
  })
})
