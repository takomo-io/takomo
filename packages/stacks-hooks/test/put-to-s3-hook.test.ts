import { Credentials } from "@aws-sdk/types"
import { CredentialManager } from "@takomo/aws-clients"
import { AwsClientProvider } from "@takomo/aws-clients/src"
import { StacksContext } from "@takomo/stacks-model/src"
import { mock } from "jest-mock-extended"
import { PutToS3Hook } from "../src"
import { mockHookInput } from "./helpers"

const s3Client = {
  putObject: jest.fn(),
}

const defaultCredentials = {
  accessKeyId: "test1234",
  secretAccessKey: "test4321",
}

const customCredentials = {
  accessKeyId: "custom1234",
  secretAccessKey: "custom4321",
}

const mockCredentialsProvider = (credentials: Credentials) =>
  jest.fn(() => Promise.resolve(credentials))

const createS3Client = jest.fn(() => Promise.resolve(s3Client))
const defaultCredentialProvider = mockCredentialsProvider(defaultCredentials)
const customCredentialProvider = mockCredentialsProvider(customCredentials)
const getCredentialProvider = jest.fn(() => defaultCredentialProvider)
const createCredentialManagerForRole = jest.fn().mockResolvedValue({
  getCredentialProvider: () => customCredentialProvider,
})

const ctx = mock<StacksContext>({
  awsClientProvider: mock<AwsClientProvider>({ createS3Client }),
  credentialManager: mock<CredentialManager>({
    createCredentialManagerForRole,
    getCredentialProvider,
  }),
})

const input = mockHookInput({ ctx })
const hookConfig = {
  bucket: "test",
  key: "testing.json",
  content: { testing: "test" },
}

describe("Put to S3 Hook", () => {
  beforeEach(jest.clearAllMocks)

  test("should getCredentials and s3Client from context and call S3 client, with correct parameters", async () => {
    s3Client.putObject.mockResolvedValue(true)
    const putToS3Hook = new PutToS3Hook(hookConfig)
    const response = await putToS3Hook.execute(input)
    expect(response).toEqual({ success: true })
    expect(getCredentialProvider).toHaveBeenCalled()
    expect(createS3Client).toHaveBeenCalledWith({
      credentialProvider: defaultCredentialProvider,
      region: input.stack.region,
      id: expect.any(String),
      logger: expect.any(Object),
    })
    expect(s3Client.putObject).toHaveBeenCalledWith(
      "test",
      "testing.json",
      '{"testing":"test"}',
    )
  })
  test("should use custom iam role if provided", async () => {
    s3Client.putObject.mockResolvedValue(true)
    const putToS3Hook = new PutToS3Hook({
      ...hookConfig,
      role: "test-arn",
    })
    const response = await putToS3Hook.execute(input)
    expect(response).toEqual({ success: true })
    expect(createCredentialManagerForRole).toHaveBeenCalledWith("test-arn")
    expect(createS3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        credentialProvider: customCredentialProvider,
      }),
    )
  })
  test("should use custom region if provided", async () => {
    s3Client.putObject.mockResolvedValue(true)
    const putToS3Hook = new PutToS3Hook({
      ...hookConfig,
      region: "eu-west-1",
    })
    const response = await putToS3Hook.execute(input)
    expect(response).toEqual({ success: true })
    expect(createS3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        region: "eu-west-1",
      }),
    )
  })
  test("s3client returns false", async () => {
    s3Client.putObject.mockResolvedValue(false)
    const putToS3Hook = new PutToS3Hook(hookConfig)
    const response = await putToS3Hook.execute(input)
    expect(response).toEqual({ success: false })
  })
  test("s3client throws error", async () => {
    const error = new Error("failure")
    s3Client.putObject.mockRejectedValue(error)
    const putToS3Hook = new PutToS3Hook(hookConfig)
    const response = await putToS3Hook.execute(input)
    expect(response).toEqual({ success: false, error })
  })
})
