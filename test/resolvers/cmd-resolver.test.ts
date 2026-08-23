import { AwsCredentialIdentity } from "@aws-sdk/types"
import { mock } from "jest-mock-extended"
import { join } from "path"
import {
  CredentialManager,
  ResolverInput,
  StacksContext,
} from "../../src/index.js"
import { createCmdResolverProvider } from "../../src/resolvers/cmd-resolver.js"
import { Stack } from "../../src/stacks/stack.js"
import { SingleResolverExecutor } from "../../src/takomo-stacks-context/model.js"
import { createConsoleLogger, createLogger } from "../../src/utils/logging.js"

const provider = createCmdResolverProvider()

interface CmdResolverProps {
  readonly command: string
  readonly exposeStackCredentials?: boolean
  readonly exposeStackRegion?: boolean
  readonly capture?: "all" | "last-line"
  readonly cwd?: string
}

const initResolver = (props: CmdResolverProps) =>
  provider.init({ resolver: "cmd", immutable: false, ...props })

const credentialManager = mock<CredentialManager>()
credentialManager.getCredentials.mockReturnValue(
  Promise.resolve(
    mock<AwsCredentialIdentity>({
      accessKeyId: "xxxx",
      secretAccessKey: "yyyy",
      sessionToken: "zzzz",
    }),
  ),
)

const input: ResolverInput = {
  logger: createConsoleLogger({ logLevel: "info" }),
  variables: { var: {}, hooks: {}, context: { projectDir: "" }, env: {} },
  ctx: mock<StacksContext>({ projectDir: process.cwd() }),
  stack: mock<Stack>({ region: "eu-central-1", credentialManager }),
  parameterName: "MyParam",
  listParameterIndex: 0,
}

const expectSuccess = async (
  props: CmdResolverProps,
  value: string,
): Promise<void> => {
  const resolver = await initResolver(props)
  const output = await resolver.resolve(input)
  expect(output).toStrictEqual(value)
}

describe("Cmd resolver", () => {
  test("Execute simple command", () =>
    expectSuccess({ command: "echo HELLO" }, "HELLO"))

  test("Current working dir", async () => {
    await expectSuccess({ command: "pwd" }, process.cwd())

    const cwd = join(process.cwd(), "test")
    await expectSuccess({ command: "pwd", cwd }, cwd)
  })

  test("Expose stack region", async () => {
    await expectSuccess(
      {
        command: "echo $AWS_DEFAULT_REGION",
        exposeStackRegion: true,
      },
      "eu-central-1",
    )

    await expectSuccess(
      {
        command: "echo $AWS_DEFAULT_REGION",
        exposeStackRegion: false,
      },
      "",
    )

    await expectSuccess({ command: "echo $AWS_DEFAULT_REGION" }, "")
  })

  test("Expose stack credentials", async () => {
    const command =
      "echo $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY $AWS_SESSION_TOKEN $AWS_SECURITY_TOKEN"

    await expectSuccess(
      {
        command,
        exposeStackCredentials: true,
      },
      "xxxx yyyy zzzz zzzz",
    )

    await expectSuccess(
      {
        command,
        exposeStackCredentials: false,
      },
      "",
    )

    await expectSuccess(
      {
        command,
      },
      "",
    )
  })

  test("Capture all output", () =>
    expectSuccess(
      {
        command: "echo 'HELLO\nWORLD\nTODAY'",
        capture: "all",
      },
      "HELLO\nWORLD\nTODAY",
    ))

  test("Capture last line output", () =>
    expectSuccess(
      {
        command: "echo 'HELLO\nWORLD\nTODAY'",
        capture: "last-line",
      },
      "TODAY",
    ))

  test("Capture last line output from cat command", () =>
    expectSuccess(
      {
        command: "cat test/resolvers/sample.txt",
        capture: "last-line",
      },
      "line 6",
    ))

  test("Does not log a confidential value from stdout", async () => {
    const sentinel = "CONFIDENTIAL_STDOUT_SENTINEL"
    const messages = new Array<string>()
    const logger = createLogger({
      logLevel: "trace",
      writer: (...args) => messages.push(args.map(String).join(" ")),
    })
    const resolver = await initResolver({ command: `printf '${sentinel}'` })
    const executor = new SingleResolverExecutor("cmd", resolver, {
      resolver: "cmd",
      confidential: true,
      immutable: false,
    })

    const output = await executor.resolve({
      ...input,
      logger,
      ctx: mock<StacksContext>({
        projectDir: process.cwd(),
        confidentialValuesLoggingEnabled: false,
      }),
    })

    expect(output).toStrictEqual(sentinel)
    expect(messages.join("\n")).not.toContain(sentinel)
    expect(messages.join("\n")).toContain("*****")
  })

  test("Does not log or throw confidential stderr", async () => {
    const sentinel = "CONFIDENTIAL_STDERR_SENTINEL"
    const messages = new Array<string>()
    const logger = createLogger({
      logLevel: "trace",
      writer: (...args) => messages.push(args.map(String).join(" ")),
    })
    const resolver = await initResolver({
      command: `node -e "process.stderr.write('${sentinel}'); process.exit(1)"`,
    })
    const executor = new SingleResolverExecutor("cmd", resolver, {
      resolver: "cmd",
      confidential: true,
      immutable: false,
    })

    const result = executor.resolve({
      ...input,
      logger,
      ctx: mock<StacksContext>({
        projectDir: process.cwd(),
        confidentialValuesLoggingEnabled: false,
      }),
    })

    await expect(result).rejects.not.toThrow(sentinel)
    expect(messages.join("\n")).not.toContain(sentinel)
    expect(messages.join("\n")).toContain("*****")
  })
})
