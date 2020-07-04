import { AnySchema } from "@hapi/joi"
import { StackName, StackPath } from "@takomo/core"
import { Stack } from "@takomo/stacks-model"

export interface TestStackProps {
  path: StackPath
  name: StackName
  dependencies?: StackPath[]
  dependants?: StackPath[]
}

export const createStack = (props: TestStackProps): Stack => {
  return new Stack({
    path: props.path,
    name: props.name,
    dependencies: props.dependencies || [],
    dependants: props.dependants || [],
    project: null,
    template: "",
    templateBucket: null,
    region: "us-east-1",
    accountIds: [],
    commandRole: null,
    tags: new Map(),
    timeout: {
      create: 0,
      update: 0,
    },
    parameters: new Map(),
    data: {},
    hooks: [],
    secrets: new Map(),
    secretsPath: "",
    credentialProvider: {
      getName: jest.fn(),
      createCredentialProviderForRole: jest.fn(),
      getCredentials: jest.fn(),
      getCallerIdentity: jest.fn(),
    },
    capabilities: [],
    ignore: false,
  })
}

type ExpectedValidationErrorAssertion = (
  value: any,
  ...expectedMessages: string[]
) => void

type ExpectedValidationSuccessAssertion = (value: any) => void

export const expectValidationErrors = (
  validator: AnySchema,
): ExpectedValidationErrorAssertion => (
  value: any,
  ...expectedMessages: string[]
) => {
  const { error } = validator.validate(value, { abortEarly: false })
  if (error === undefined) {
    fail("Expected error to be defined")
  }

  const expected = expectedMessages.slice().sort().join("\n")
  const actual = error.details
    .map((d) => d.message)
    .sort()
    .join("\n")

  expect(actual).toBe(expected)
}

export const expectNoValidationError = (
  validator: AnySchema,
): ExpectedValidationSuccessAssertion => (value: any) => {
  const { error } = validator.validate(value, { abortEarly: false })
  expect(error).toBeUndefined()
}
