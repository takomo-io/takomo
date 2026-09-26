import { mock } from "jest-mock-extended"
import { DeploymentConfigObject } from "../../../src/config/common-config.js"
import { StackGroupConfig } from "../../../src/config/stack-group-config.js"
import { CommandContext } from "../../../src/context/command-context.js"
import { createStackGroup } from "../../../src/stacks/stack-group.js"
import { StackGroupConfigNode } from "../../../src/takomo-stacks-context/config/config-tree.js"
import { populatePropertiesFromConfigFile } from "../../../src/takomo-stacks-context/config/populate-properties-from-config-file.js"
import { SchemaRegistry } from "../../../src/takomo-stacks-model/schemas.js"
import { ROOT_STACK_GROUP_PATH } from "../../../src/takomo-stacks-model/constants.js"
import { createConsoleLogger } from "../../../src/utils/logging.js"

const logger = createConsoleLogger({ logLevel: "info" })

const parentGroup = (deploymentConfig?: DeploymentConfigObject) =>
  createStackGroup({
    name: ROOT_STACK_GROUP_PATH,
    path: ROOT_STACK_GROUP_PATH,
    regions: [],
    accountIds: [],
    stacks: [],
    children: [],
    tags: new Map(),
    hooks: [],
    data: {},
    ignore: false,
    obsolete: false,
    terminationProtection: false,
    timeout: { create: 0, update: 0 },
    deploymentConfig,
  })

const configFile = (
  deploymentConfig?: DeploymentConfigObject,
): StackGroupConfig => ({
  regions: [],
  tags: new Map(),
  inheritTags: true,
  data: {},
  hooks: [],
  deploymentConfig,
})

const node = (config?: StackGroupConfig): StackGroupConfigNode => ({
  path: ROOT_STACK_GROUP_PATH,
  name: ROOT_STACK_GROUP_PATH,
  children: [],
  stacks: [],
  getConfig: async () => config,
})

const populate = async (
  parent?: DeploymentConfigObject,
  config?: DeploymentConfigObject,
) => {
  const result = await populatePropertiesFromConfigFile(
    mock<CommandContext>(),
    mock<SchemaRegistry>(),
    logger,
    {},
    parentGroup(parent),
    node(configFile(config)),
  )

  return result.deploymentConfig
}

describe("#populatePropertiesFromConfigFile deployment config", () => {
  test("no deployment config in parent or config file", async () => {
    expect(await populate(undefined, undefined)).toBeUndefined()
  })

  test("deployment config inherited from parent", async () => {
    expect(await populate({ mode: "EXPRESS" }, undefined)).toStrictEqual({
      mode: "EXPRESS",
    })
  })

  test("deployment config defined in config file", async () => {
    expect(
      await populate(undefined, { mode: "EXPRESS", disableRollback: true }),
    ).toStrictEqual({ mode: "EXPRESS", disableRollback: true })
  })

  test("config file overrides parent", async () => {
    expect(
      await populate(
        { mode: "EXPRESS", disableRollback: true },
        { mode: "STANDARD", disableRollback: false },
      ),
    ).toStrictEqual({ mode: "STANDARD", disableRollback: false })
  })

  test("properties missing from config file are inherited from parent", async () => {
    expect(
      await populate(
        { mode: "EXPRESS", disableRollback: true },
        { disableRollback: false },
      ),
    ).toStrictEqual({ mode: "EXPRESS", disableRollback: false })
  })
})
