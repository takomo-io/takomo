import { ResolverProvider } from "@takomo/stacks-model"
import { createCmdResolverProvider } from "./cmd-resolver"
import { createExternalStackOutputResolverProvider } from "./external-stack-output-resolver"
import { createFileContentsResolverProvider } from "./file-contents-resolver"
import { createStackOutputResolverProvider } from "./stack-output-resolver"
import { createStaticResolverProvider } from "./static-resolver"
export { ResolverRegistry } from "./resolver-registry"

export const coreResolverProviders = (): ReadonlyArray<ResolverProvider> => [
  createCmdResolverProvider(),
  createExternalStackOutputResolverProvider(),
  createStackOutputResolverProvider(),
  createStaticResolverProvider(),
  createFileContentsResolverProvider(),
]
