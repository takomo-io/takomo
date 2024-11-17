import { StackName } from "../../../src/aws/cloudformation/model.js"
import { StackPath } from "../../../src/stacks/stack.js"
import { StacksOperationOutput } from "../../../src/command/stacks/model.js"
import { StackResult } from "../../../src/command/command-model.js"

interface ExpectStackTemplateProps {
  readonly templateBody: string
  readonly stackName: StackName
  readonly stackPath: StackPath
}

export interface EmitStackTemplatesOutputMatcher {
  expectCommandToSucceed: () => EmitStackTemplatesOutputMatcher
  expectStackTemplate: (
    props: ExpectStackTemplateProps,
  ) => EmitStackTemplatesOutputMatcher
  assert: () => Promise<StacksOperationOutput>
}

export const createEmitStackTemplatesOutputMatcher = (
  executor: () => Promise<StacksOperationOutput>,
  stackAssertions: ((stackResult: StackResult) => boolean)[] = [],
  outputAssertions?: (output: StacksOperationOutput) => void,
): EmitStackTemplatesOutputMatcher => {
  const expectCommandToSucceed = () =>
    createEmitStackTemplatesOutputMatcher(
      executor,
      stackAssertions,
      (output) => {
        expect(output.status).toEqual("SUCCESS")
        expect(output.message).toEqual("Success")
        expect(output.success).toEqual(true)
        expect(output.error).toBeUndefined()
      },
    )

  const assert = async (): Promise<StacksOperationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }
    expect(output.results).toHaveLength(stackAssertions.length)
    output.results.forEach((result) => {
      if (!stackAssertions.some((s) => s(result))) {
        fail(`Unexpected stack with path: ${result.stack.path}`)
      }
    })
    return output
  }

  const expectStackTemplate = ({
    stackName,
    stackPath,
    templateBody,
  }: ExpectStackTemplateProps): EmitStackTemplatesOutputMatcher => {
    const stackMatcher = (stackResult: StackResult): boolean => {
      if (stackResult.stack.path !== stackPath) {
        return false
      }

      expect(stackResult.stack.path).toEqual(stackPath)
      expect(stackResult.stack.name).toEqual(stackName)
      expect(stackResult.templateBody).toEqual(templateBody)

      return true
    }

    return createEmitStackTemplatesOutputMatcher(
      executor,
      [...stackAssertions, stackMatcher],
      outputAssertions,
    )
  }

  return {
    expectCommandToSucceed,
    expectStackTemplate,
    assert,
  }
}
