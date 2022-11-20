import { Credentials } from "@aws-sdk/types"
import R from "ramda"
import { Region } from "../takomo-aws-model"
import { deepCopy } from "../takomo-util"

type AwsEnvVariableName =
  | "AWS_ACCESS_KEY_ID"
  | "AWS_CA_BUNDLE"
  | "AWS_CLI_AUTO_PROMPT"
  | "AWS_CLI_FILE_ENCODING"
  | "AWS_CONFIG_FILE"
  | "AWS_DEFAULT_OUTPUT"
  | "AWS_DEFAULT_REGION"
  | "AWS_EC2_METADATA_DISABLED"
  | "AWS_MAX_ATTEMPTS"
  | "AWS_PAGER"
  | "AWS_PROFILE"
  | "AWS_RETRY_MODE"
  | "AWS_ROLE_SESSION_NAME"
  | "AWS_SECRET_ACCESS_KEY"
  | "AWS_SECURITY_TOKEN"
  | "AWS_SESSION_TOKEN"
  | "AWS_SHARED_CREDENTIALS_FILE"
  | "AWS_STS_REGIONAL_ENDPOINTS"

const awsEnvVariableNames: ReadonlyArray<AwsEnvVariableName | string> = [
  "AWS_ACCESS_KEY_ID",
  "AWS_CA_BUNDLE",
  "AWS_CLI_AUTO_PROMPT",
  "AWS_CLI_FILE_ENCODING",
  "AWS_CONFIG_FILE",
  "AWS_DEFAULT_OUTPUT",
  "AWS_DEFAULT_REGION",
  "AWS_EC2_METADATA_DISABLED",
  "AWS_MAX_ATTEMPTS",
  "AWS_PAGER",
  "AWS_PROFILE",
  "AWS_RETRY_MODE",
  "AWS_ROLE_SESSION_NAME",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_SECURITY_TOKEN",
  "AWS_SESSION_TOKEN",
  "AWS_SHARED_CREDENTIALS_FILE",
  "AWS_STS_REGIONAL_ENDPOINTS",
]

interface PrepareEnvVariablesProps {
  readonly credentials?: Credentials
  readonly region?: Region
  readonly additionalVariables?: Record<string, string>
  readonly env: any
}

const removeAwsEnvironmentVariables = (
  props: PrepareEnvVariablesProps,
): PrepareEnvVariablesProps => {
  const env = Object.keys(props.env)
    .filter((key) => !awsEnvVariableNames.includes(key))
    .reduce((collected, key) => ({ ...collected, [key]: props.env[key] }), {})

  return {
    ...props,
    env,
  }
}

const setVariable = (
  props: PrepareEnvVariablesProps,
  name: AwsEnvVariableName,
  getter: () => string | undefined,
): PrepareEnvVariablesProps => {
  const value = getter()
  if (!value) {
    return props
  }

  return {
    ...props,
    env: {
      ...props.env,
      [name]: value,
    },
  }
}

const setRegion = (props: PrepareEnvVariablesProps): PrepareEnvVariablesProps =>
  setVariable(props, "AWS_DEFAULT_REGION", () => props.region)

const setAccessKeyId = (
  props: PrepareEnvVariablesProps,
): PrepareEnvVariablesProps =>
  setVariable(props, "AWS_ACCESS_KEY_ID", () => props.credentials?.accessKeyId)

const setSecretAccessKey = (
  props: PrepareEnvVariablesProps,
): PrepareEnvVariablesProps =>
  setVariable(
    props,
    "AWS_SECRET_ACCESS_KEY",
    () => props.credentials?.secretAccessKey,
  )

const setSessionToken = (
  props: PrepareEnvVariablesProps,
): PrepareEnvVariablesProps =>
  setVariable(props, "AWS_SESSION_TOKEN", () => props.credentials?.sessionToken)

const setSecurityToken = (
  props: PrepareEnvVariablesProps,
): PrepareEnvVariablesProps =>
  setVariable(
    props,
    "AWS_SECURITY_TOKEN",
    () => props.credentials?.sessionToken,
  )

const setAdditionalVariables = (
  props: PrepareEnvVariablesProps,
): PrepareEnvVariablesProps => {
  if (!props.additionalVariables) {
    return props
  }

  return {
    ...props,
    env: {
      ...props.env,
      ...props.additionalVariables,
    },
  }
}

const getEnv = ({ env }: PrepareEnvVariablesProps): any => env

const copyEnv = (
  props: PrepareEnvVariablesProps,
): PrepareEnvVariablesProps => ({ ...props, env: deepCopy(props.env) })

export const prepareAwsEnvVariables = (
  props: PrepareEnvVariablesProps,
): any => {
  return R.pipe(
    copyEnv,
    removeAwsEnvironmentVariables,
    setAdditionalVariables,
    setRegion,
    setAccessKeyId,
    setSecretAccessKey,
    setSecurityToken,
    setSessionToken,
    getEnv,
  )(props)
}
