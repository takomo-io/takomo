import { CloudFormation } from "@aws-sdk/client-cloudformation"
import { Credentials } from "@aws-sdk/types"
import { mock } from "jest-mock-extended"

import { HookConfig } from "../../src/hooks/hook"
import { InternalStack, RawTagValue, StackPath } from "../../src/stacks/stack"
import {
  StackGroup,
  StackGroupName,
  StackGroupPath,
} from "../../src/stacks/stack-group"
import {
  CloudFormationClient,
  InternalCredentialManager,
} from "../../src/takomo-aws-clients"
import {
  AccountId,
  Region,
  StackCapability,
  StackName,
  StackPolicyBody,
  TagKey,
} from "../../src/takomo-aws-model"
import { CommandRole, Project } from "../../src/takomo-core/command"
import { StackConfig, TemplateConfig } from "../../src/takomo-stacks-config"
import { ROOT_STACK_GROUP_PATH } from "../../src/takomo-stacks-model/constants"
import { createConsoleLogger } from "../../src/utils/logging"

export interface CreateStackGroupProps {
  name?: StackGroupName
  path?: StackGroupPath
  project?: Project
  stacks?: InternalStack[]
  children?: StackGroup[]
  capabilities?: ReadonlyArray<StackCapability>
  regions?: ReadonlyArray<Region>
  accountIds?: ReadonlyArray<AccountId>
  commandRole?: CommandRole
  ignore?: boolean
  obsolete?: boolean
  terminationProtection?: boolean
  stackPolicy?: StackPolicyBody
  stackPolicyDuringUpdate?: StackPolicyBody
  tags?: Map<TagKey, RawTagValue>
  data?: Record<string, any>
  hooks?: ReadonlyArray<HookConfig>
}

export const createStackGroup = (
  props: CreateStackGroupProps = {},
): StackGroup => ({
  name: "not-set",
  path: ROOT_STACK_GROUP_PATH,
  root: props.path === ROOT_STACK_GROUP_PATH,
  stacks: [],
  children: [],
  regions: [],
  accountIds: [],
  tags: new Map(),
  hooks: [],
  data: {},
  ignore: false,
  obsolete: false,
  terminationProtection: false,
  toProps: jest.fn(),
  ...props,
})

export interface TestStackProps {
  path: StackPath
  name: StackName
  dependencies?: StackPath[]
  dependents?: StackPath[]
}

export const createStack = (
  props: TestStackProps,
  allStacks?: Array<InternalStack>,
): InternalStack => {
  const stack: InternalStack = {
    path: props.path,
    name: props.name,
    dependencies: props.dependencies ?? [],
    dependents: props.dependents ?? [],
    template: { dynamic: true, filename: "" },
    region: "us-east-1",
    accountIds: [],
    tags: new Map(),
    timeout: {
      create: 0,
      update: 0,
    },
    parameters: new Map(),
    data: {},
    hooks: [],
    capabilities: [],
    ignore: false,
    obsolete: false,
    terminationProtection: false,
    logger: createConsoleLogger({
      logLevel: "info",
    }),
    stackGroupPath: "/",
    getCloudFormationClient: jest.fn(),
    toProps: () => ({
      ignore: false,
      obsolete: false,
      terminationProtection: false,
      timeout: {
        create: 0,
        update: 0,
      },
      stackGroupPath: "/",
      path: props.path,
      parameters: new Map(),
      logger: createConsoleLogger({
        logLevel: "info",
      }),
      dependencies: props.dependencies ?? [],
      dependents: props.dependents ?? [],
      region: "us-east-1",
      accountIds: [],
      tags: new Map(),
      template: { dynamic: true, filename: "" },
      data: {},
      hooks: [],
      name: props.name,
      credentialManager: mock<InternalCredentialManager>(),
      getCloudFormationClient: async () => mock<CloudFormationClient>(),
    }),
    credentialManager: mock<InternalCredentialManager>(),
    getCurrentCloudFormationStack: jest.fn(),
    getCredentials: async () => mock<Credentials>(),
    getClient: async () => mock<CloudFormation>(),
  }

  if (allStacks) {
    allStacks.push(stack)
  }

  return stack
}

export interface CreateStackConfigProps {
  name?: StackName
  project?: string
  regions?: ReadonlyArray<Region>
  accountIds?: ReadonlyArray<AccountId>
  capabilities?: ReadonlyArray<StackCapability>
  template?: TemplateConfig
  commandRole?: CommandRole
  ignore?: boolean
  obsolete?: boolean
  terminationProtection?: boolean
  stackPolicy?: StackPolicyBody
  stackPolicyDuringUpdate?: StackPolicyBody
  tags?: Map<TagKey, RawTagValue>
  inheritTags?: boolean
  depends?: ReadonlyArray<StackPath>
  data?: Record<string, any>
  hooks?: ReadonlyArray<HookConfig>
}

export const createStackConfig = (
  props: CreateStackConfigProps = {},
): StackConfig => ({
  data: {},
  regions: [],
  hooks: [],
  tags: new Map(),
  parameters: new Map(),
  ...props,
})
