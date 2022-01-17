import { DetailedCloudFormationStack } from "@takomo/aws-model"
import { InternalStack } from "@takomo/stacks-model"
import { createCapturingLogWriter } from "@takomo/test-unit"
import { bold, green } from "@takomo/util"
import { mock } from "jest-mock-extended"
import { createBaseIO } from "../../../src/cli-io"
import { printStackPolicy } from "../../../src/stacks/deploy-stacks/stack-policy"

const doPrintStackPolicy = (
  updatedStack: InternalStack,
  currentStack?: DetailedCloudFormationStack,
): string => {
  const output = { value: "" }

  printStackPolicy(
    createBaseIO({ writer: createCapturingLogWriter(output) }),
    updatedStack,
    currentStack,
  )

  return output.value
}

const policy1 = `
 {
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "Update:*",
        "Principal": "*",
        "Resource": "*"
      }
    ]
  }
`

const policy2 = `
 {
    "Statement": [
      {
        "Action": "Update:*",
        "Principal": "*",
        "Effect": "Allow",
        "Resource": "*"
      }
    ]
  }
`

const updatedStack = (stackPolicy?: string): InternalStack =>
  mock<InternalStack>({ stackPolicy })

const currentStack = (stackPolicyBody?: string): DetailedCloudFormationStack =>
  mock<DetailedCloudFormationStack>({ stackPolicyBody })

describe("#printStackPolicy", () => {
  test("current stack exists but it doesn't have stack policy and neither does updated stack", () => {
    const output = doPrintStackPolicy(updatedStack(), currentStack())
    expect(output).toStrictEqual("")
  })

  test("current stack and updated stacks have same policy", () => {
    const output = doPrintStackPolicy(
      updatedStack(policy1),
      currentStack(policy1),
    )
    expect(output).toStrictEqual("")
  })

  test("current stack and updated stacks have same policy but properties are in different order", () => {
    const output = doPrintStackPolicy(
      updatedStack(policy1),
      currentStack(policy2),
    )
    expect(output).toStrictEqual("")
  })

  test("current stack exists but it doesn't have stack policy and updated stack has policy", () => {
    const output = doPrintStackPolicy(updatedStack(policy1), currentStack())

    const expected =
      `\n${bold("Stack policy:")}\n\n` +
      `  Stack policy will be created\n\n` +
      green(
        `  + {\n` +
          `  +   "Statement": [\n` +
          `  +     {\n` +
          `  +       "Action": "Update:*",\n` +
          `  +       "Effect": "Allow",\n` +
          `  +       "Principal": "*",\n` +
          `  +       "Resource": "*"\n` +
          `  +     }\n` +
          `  +   ]\n` +
          `  + }`,
      ) +
      "\n"

    expect(output).toStrictEqual(expected)
  })
})
