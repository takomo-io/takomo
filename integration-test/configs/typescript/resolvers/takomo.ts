import {
  ParameterConfig,
  Resolver,
  ResolverInput,
  ResolverProvider,
  TakomoConfig,
  TakomoConfigProvider,
} from "../../../../dist/index.js"

const exampleResolverProvider: ResolverProvider = {
  init: async (config: ParameterConfig): Promise<Resolver> => {
    return {
      resolve: async (input: ResolverInput): Promise<string> => {
        return "hello"
      },
    }
  },
  name: "my-resolver",
}

const provider: TakomoConfigProvider = async (): Promise<TakomoConfig> => {
  return {
    resolverProviders: [exampleResolverProvider],
  }
}

export default provider
