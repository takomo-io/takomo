import { ResolverProvider } from "@takomo/stacks-model"
import {
  CmdResolverProvider,
  ExternalStackOutputResolverProvider,
  SecretResolverProvider,
  StackOutputResolverProvider,
  StaticResolverProvider,
} from "./impl"
export { ListResolver } from "./impl"
export { ResolverRegistry } from "./resolver-registry"

export const coreResolverProviders = (): ResolverProvider[] => [
  new CmdResolverProvider(),
  new ExternalStackOutputResolverProvider(),
  new SecretResolverProvider(),
  new StackOutputResolverProvider(),
  new StaticResolverProvider(),
]
