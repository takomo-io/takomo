import { AnySchema } from "@hapi/joi"
import {
  Constants,
  StackGroupName,
  StackGroupPath,
  StackName,
  StackPath,
} from "@takomo/core"
import { Stack, StackGroup } from "@takomo/stacks-model"

export interface TestStackGroupProps {
  name: StackGroupName
  path: StackGroupPath
  stacks?: Stack[]
  children?: StackGroup[]
}

export const createStackGroup = (props: TestStackGroupProps): StackGroup =>
  new StackGroup({
    name: props.name,
    path: props.path,
    isRoot: props.path === Constants.ROOT_STACK_GROUP_PATH,
    stacks: props.stacks || [],
    children: props.children || [],
    project: null,
    regions: ["us-east-1"],
    accountIds: [],
    commandRole: null,
    templateBucket: null,
    timeout: null,
    tags: new Map(),
    hooks: [],
    data: {},
    capabilities: [],
    ignore: false,
  })

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

export const createStackConfig = (
  stackPath: StackPath,
  dependencies: StackPath[] = [],
): Stack =>
  new Stack({
    project: null,
    path: stackPath,
    name: "",
    template: "",
    templateBucket: null,
    region: "eu-west-1",
    accountIds: [],
    commandRole: null,
    tags: new Map(),
    timeout: {
      update: 0,
      create: 0,
    },
    parameters: new Map(),
    dependencies,
    dependants: [],
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
    capabilities: null,
    ignore: false,
  })

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
  const {
    error: { details },
  } = validator.validate(value, { abortEarly: false })

  const expected = expectedMessages.slice().sort().join("\n")
  const actual = details
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
