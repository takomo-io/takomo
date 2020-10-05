import {
  IamRoleArn,
  Options,
  TakomoCredentialProvider,
  Variables,
} from "@takomo/core"
import { HookInitializersMap, StackGroup } from "@takomo/stacks-model"
import { ResolverRegistry } from "@takomo/stacks-resolvers"
import { Logger, TemplateEngine } from "@takomo/util"
import { createStackGroup } from "./create-stack-group"
import { StackGroupConfigNode } from "./tree/stack-group-config-node"

export const buildStackGroup = async (
  logger: Logger,
  credentialProvider: TakomoCredentialProvider,
  credentialsProviders: Map<IamRoleArn, TakomoCredentialProvider>,
  resolverRegistry: ResolverRegistry,
  hookInitializers: HookInitializersMap,
  options: Options,
  variables: Variables,
  node: StackGroupConfigNode,
  parent: StackGroup | null,
  templateEngine: TemplateEngine,
): Promise<StackGroup> => {
  const stackGroup = await createStackGroup(
    logger,
    options,
    variables,
    node,
    parent,
    templateEngine,
  )

  return stackGroup
}
