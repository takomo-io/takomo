import { ResolverName } from "../model"
import {
  CmdResolver,
  ExternalStackOutputResolver,
  SecretResolver,
  StackOutputResolver,
  StaticResolver,
} from "./impl"
import { ResolverInitializer, ResolverInitializersMap } from "./model"

export const coreResolverInitializers = (): ResolverInitializersMap =>
  new Map<ResolverName, ResolverInitializer>([
    ["stack-output", async (props: any) => new StackOutputResolver(props)],
    [
      "external-stack-output",
      async (props: any) => new ExternalStackOutputResolver(props),
    ],
    ["cmd", async (props: any) => new CmdResolver(props)],
    ["secret", async (props: any) => new SecretResolver(props)],
    ["static", async (props: any) => new StaticResolver(props)],
  ])
