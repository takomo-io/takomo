import { InitProjectOutput } from "@takomo/init-command"

export interface InitProjectOutputMatcher {
  expectOutputToBeSuccessful: () => InitProjectOutputMatcher
  assert: () => Promise<InitProjectOutput>
}

export const createInitProjectOutputMatcher = (
  executor: () => Promise<InitProjectOutput>,
  outputAssertions?: (output: InitProjectOutput) => void,
): InitProjectOutputMatcher => {
  const expectOutputToBeSuccessful = () =>
    createInitProjectOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<InitProjectOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }
    return output
  }

  return {
    expectOutputToBeSuccessful,
    assert,
  }
}
