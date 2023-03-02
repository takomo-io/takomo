import dedent from "ts-dedent"
import { createBaseIO } from "../../../../src/cli-io/cli-io.js"
import { printTerminationProtection } from "../../../../src/cli-io/stacks/deploy-stacks/termination-protection.js"
import { bold, green, grey, red } from "../../../../src/utils/colors.js"
import { createCapturingLogWriter } from "../../../capturing-log-writer.js"
import {
  mockDetailedCloudFormationStack,
  mockInternalStack,
} from "../../mocks.js"

const doPrintTerminationProtection = (
  newTerminationProtection: boolean,
  existingTerminationProtection?: boolean,
): string => {
  const output = { value: "" }

  const existingStack =
    existingTerminationProtection === undefined
      ? undefined
      : mockDetailedCloudFormationStack({
          enableTerminationProtection: existingTerminationProtection,
        })

  printTerminationProtection(
    createBaseIO({ writer: createCapturingLogWriter(output) }),
    mockInternalStack({
      name: "x",
      region: "eu-north-1",
      path: "/x.yml/eu-north-1",
      terminationProtection: newTerminationProtection,
    }),
    existingStack,
  )

  return output.value
}

describe("#printTerminationProtection", () => {
  describe("prints correct output", () => {
    test("when stack is being created and termination protection is disabled", () => {
      const output = doPrintTerminationProtection(false)
      const expected = dedent`
      
      ${bold("Termination protection:")}
      
        current value:                 ${grey("<undefined>")}
        new value:                     ${red("disabled")}
      
      `

      expect(output).toStrictEqual(expected)
    })

    test("when stack is being created and termination protection is enabled", () => {
      const output = doPrintTerminationProtection(true)
      const expected = dedent`
      
      ${bold("Termination protection:")}
      
        current value:                 ${grey("<undefined>")}
        new value:                     ${green("enabled")}
      
      `

      expect(output).toStrictEqual(expected)
    })

    test("when stack is being updated and termination protection changed from enabled to disabled", () => {
      const output = doPrintTerminationProtection(false, true)
      const expected = dedent`
      
      ${bold("Termination protection:")}
      
        current value:                 enabled
        new value:                     ${red("disabled")}
      
      `

      expect(output).toStrictEqual(expected)
    })

    test("when stack is being updated and termination protection changed from disabled to enabled", () => {
      const output = doPrintTerminationProtection(true, false)
      const expected = dedent`
      
      ${bold("Termination protection:")}
      
        current value:                 disabled
        new value:                     ${green("enabled")}
      
      `

      expect(output).toStrictEqual(expected)
    })

    test("when stack is being updated and termination protection is not changed", () => {
      const output = doPrintTerminationProtection(false, false)
      const expected = ""

      expect(output).toStrictEqual(expected)
    })
  })
})
