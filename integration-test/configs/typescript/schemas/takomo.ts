import { AnySchema } from "joi"
import {
  InitSchemaProps,
  SchemaProvider,
  TakomoConfig,
  TakomoConfigProvider,
} from "../../../../dist/index.js"

const exampleSchemaProvider: SchemaProvider = {
  init: async ({ joi }: InitSchemaProps): Promise<AnySchema> => {
    return joi.string().valid("only-valid-name")
  },
  name: "my-schema",
}

const provider: TakomoConfigProvider = async (): Promise<TakomoConfig> => {
  return {
    schemaProviders: [exampleSchemaProvider],
  }
}

export default provider
