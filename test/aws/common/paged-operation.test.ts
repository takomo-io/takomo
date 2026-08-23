import { pagedOperationV2 } from "../../../src/aws/common/client.js"

interface TestParams {
  readonly NextToken?: string
}

interface TestResponse {
  readonly Items?: ReadonlyArray<string>
  readonly NextToken?: string
}

describe("#pagedOperationV2", () => {
  test("continues through every page by default", async () => {
    const requestedTokens = new Array<string | undefined>()
    const responses: Record<string, TestResponse> = {
      first: { Items: ["one"], NextToken: "second" },
      second: { Items: ["two"], NextToken: "third" },
      third: { Items: ["three"] },
    }

    const items = await pagedOperationV2({
      operation: async ({ NextToken }) => {
        requestedTokens.push(NextToken)
        return responses[NextToken ?? "first"]
      },
      params: {},
      extractor: (response) => response.Items,
    })

    expect(items).toStrictEqual(["one", "two", "three"])
    expect(requestedTokens).toStrictEqual([undefined, "second", "third"])
  })

  test("continues after an empty page that includes a next token", async () => {
    const requestedTokens = new Array<string | undefined>()
    const responses: Record<string, TestResponse> = {
      first: { Items: ["one"], NextToken: "empty" },
      empty: { Items: [], NextToken: "last" },
      last: { Items: ["two"] },
    }

    const items = await pagedOperationV2({
      operation: async ({ NextToken }: TestParams) => {
        requestedTokens.push(NextToken)
        return responses[NextToken ?? "first"]
      },
      params: {},
      extractor: (response) => response.Items,
    })

    expect(items).toStrictEqual(["one", "two"])
    expect(requestedTokens).toStrictEqual([undefined, "empty", "last"])
  })
})
