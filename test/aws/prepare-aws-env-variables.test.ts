import { Credentials } from "@aws-sdk/types"
import { mock } from "jest-mock-extended"
import { prepareAwsEnvVariables } from "../../src/aws/util"

describe("#prepareAwsEnvVariables", () => {
  test("removes all aws env variables", () => {
    const env = {
      AWS_ACCESS_KEY_ID: "x",
      AWS_CA_BUNDLE: "x",
      AWS_CLI_AUTO_PROMPT: "x",
      AWS_CLI_FILE_ENCODING: "x",
      AWS_CONFIG_FILE: "x",
      AWS_DEFAULT_OUTPUT: "x",
      AWS_DEFAULT_REGION: "x",
      AWS_EC2_METADATA_DISABLED: "x",
      AWS_MAX_ATTEMPTS: "x",
      AWS_PAGER: "x",
      AWS_PROFILE: "x",
      AWS_RETRY_MODE: "x",
      AWS_ROLE_SESSION_NAME: "x",
      AWS_SECRET_ACCESS_KEY: "x",
      AWS_SECURITY_TOKEN: "x",
      AWS_SESSION_TOKEN: "x",
      AWS_SHARED_CREDENTIALS_FILE: "x",
      AWS_STS_REGIONAL_ENDPOINTS: "x",
    }

    expect(prepareAwsEnvVariables({ env })).toStrictEqual({})
  })

  test("add credentials aws env variables", () => {
    const env = {}

    const credentials = mock<Credentials>({
      accessKeyId: "a",
      secretAccessKey: "b",
      sessionToken: "c",
    })

    expect(prepareAwsEnvVariables({ env, credentials })).toStrictEqual({
      AWS_ACCESS_KEY_ID: "a",
      AWS_SECRET_ACCESS_KEY: "b",
      AWS_SECURITY_TOKEN: "c",
      AWS_SESSION_TOKEN: "c",
    })
  })

  test("override credentials aws env variables", () => {
    const env = {
      AWS_ACCESS_KEY_ID: "x",
      AWS_SECRET_ACCESS_KEY: "y",
      AWS_SECURITY_TOKEN: "z",
      AWS_SESSION_TOKEN: "z",
    }

    const credentials = mock<Credentials>({
      accessKeyId: "1",
      secretAccessKey: "2",
      sessionToken: "3",
    })

    expect(prepareAwsEnvVariables({ env, credentials })).toStrictEqual({
      AWS_ACCESS_KEY_ID: "1",
      AWS_SECRET_ACCESS_KEY: "2",
      AWS_SECURITY_TOKEN: "3",
      AWS_SESSION_TOKEN: "3",
    })
  })

  test("add region aws env variable", () => {
    const env = {}

    expect(prepareAwsEnvVariables({ env, region: "eu-west-1" })).toStrictEqual({
      AWS_DEFAULT_REGION: "eu-west-1",
    })
  })

  test("override region aws env variable", () => {
    const env = {
      AWS_DEFAULT_REGION: "us-east-1",
    }

    expect(
      prepareAwsEnvVariables({ env, region: "eu-central-1" }),
    ).toStrictEqual({
      AWS_DEFAULT_REGION: "eu-central-1",
    })
  })

  test("add additional variables", () => {
    const env = {}
    const additionalVariables = {
      A: "a",
      B: "b",
    }

    expect(prepareAwsEnvVariables({ env, additionalVariables })).toStrictEqual({
      A: "a",
      B: "b",
    })
  })

  test("complex example", () => {
    const env = {
      USER: "john",
      ENVIRONMENT: "dev",
    }
    const additionalVariables = {
      A: "a",
      B: "b",
    }
    const credentials = mock<Credentials>({
      accessKeyId: "1",
      secretAccessKey: "2",
      sessionToken: "3",
    })

    expect(
      prepareAwsEnvVariables({ env, additionalVariables, credentials }),
    ).toStrictEqual({
      A: "a",
      B: "b",
      USER: "john",
      ENVIRONMENT: "dev",
      AWS_ACCESS_KEY_ID: "1",
      AWS_SECRET_ACCESS_KEY: "2",
      AWS_SECURITY_TOKEN: "3",
      AWS_SESSION_TOKEN: "3",
    })
  })
})
