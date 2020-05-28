import { Resolver, ResolverProvider } from "@takomo/stacks-model"
import {
  CmdResolver,
  ExternalStackOutputResolver,
  SecretResolver,
  StackOutputResolver,
  StaticResolver,
} from "./impl"
export { ListResolver } from "./impl"
export { ResolverRegistry } from "./resolver-registry"

export const coreResolverProviders = (): ResolverProvider[] => [
  {
    name: "stack-output",
    init: async (props: any): Promise<Resolver> =>
      new StackOutputResolver(props),
  },
  {
    name: "external-stack-output",
    init: async (props: any) => new ExternalStackOutputResolver(props),
  },
  {
    name: "cmd",
    init: async (props: any) => new CmdResolver(props),
  },
  {
    name: "secret",
    init: async (props: any) => new SecretResolver(props),
  },
  {
    name: "static",
    init: async (props: any) => new StaticResolver(props),
  },
]
