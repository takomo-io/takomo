import { jest } from "@jest/globals"
import {
  HandlerExecutionContext,
  InitializeHandler,
  MetadataBearer,
} from "@aws-sdk/types"
import { apiRequestListenerMiddleware } from "../../../src/aws/common/request-listener.js"
import { createLogger } from "../../../src/utils/logging.js"

const sentinel = "CONFIDENTIAL_AWS_SENTINEL"

interface TestInput {
  readonly TemplateBody: string
  readonly Parameters: ReadonlyArray<{
    readonly ParameterKey: string
    readonly ParameterValue: string
  }>
}

interface TestOutput extends MetadataBearer {
  readonly secretOutput: string
}

const invokeMiddleware = async (
  confidentialValuesLoggingEnabled: boolean,
): Promise<string> => {
  const messages = new Array<string>()
  const logger = createLogger({
    logLevel: "trace",
    writer: (...args) => messages.push(args.map(String).join(" ")),
  })
  const listener = { onApiCall: jest.fn() }
  const next: InitializeHandler<TestInput, TestOutput> = async () => ({
    response: {},
    output: {
      $metadata: { attempts: 1 },
      secretOutput: sentinel,
    },
  })
  const context: HandlerExecutionContext = {
    clientName: "CloudFormationClient",
    commandName: "CreateStackCommand",
    inputFilterSensitiveLog: (input: unknown) => input,
    outputFilterSensitiveLog: (output: unknown) => output,
  }

  const handler = apiRequestListenerMiddleware(
    logger,
    "client",
    listener,
    confidentialValuesLoggingEnabled,
  )(next, context)

  await handler({
    input: {
      TemplateBody: sentinel,
      Parameters: [{ ParameterKey: "Secret", ParameterValue: sentinel }],
    },
  })

  expect(listener.onApiCall).toHaveBeenCalledTimes(1)
  return messages.join("\n")
}

describe("API request listener confidential logging", () => {
  test("redacts AWS request and response payloads by default", async () => {
    const messages = await invokeMiddleware(false)

    expect(messages).not.toContain(sentinel)
    expect(messages).toContain("*****")
    expect(messages).toContain("CreateStackCommand")
  })

  test("logs AWS request and response payloads when explicitly enabled", async () => {
    const messages = await invokeMiddleware(true)

    expect(messages).toContain(sentinel)
  })
})
