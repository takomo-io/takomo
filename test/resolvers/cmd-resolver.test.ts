import { Credentials } from "@aws-sdk/types"
import { mock } from "jest-mock-extended"
import { join } from "path"
import { CredentialManager, ResolverInput, StacksContext } from "../../src"
import { createCmdResolverProvider } from "../../src/resolvers/cmd-resolver"
import { Stack } from "../../src/stacks/stack"
import { createConsoleLogger } from "../../src/utils/logging"

const provider = createCmdResolverProvider()

const credentialManager = mock<CredentialManager>()
credentialManager.getCredentials.mockReturnValue(
  Promise.resolve(
    mock<Credentials>({
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

const expectSuccess = async (props: any, value: string): Promise<void> => {
  const resolver = await provider.init(props)
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
})
