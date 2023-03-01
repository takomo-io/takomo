import { TkmLogger } from "../../utils/logging.js"
import {
  TemplateEngineProps,
  TemplateEngineProvider,
} from "../template-engine-provider.js"
import { TemplateEngine } from "../template-engine.js"
import { EjsTemplateEngine } from "./ejs-template-engine.js"

interface EjsTemplateEngineProviderProps {
  readonly logger: TkmLogger
}

export class EjsTemplateEngineProvider implements TemplateEngineProvider {
  readonly #logger: TkmLogger
  constructor({ logger }: EjsTemplateEngineProviderProps) {
    this.#logger = logger
  }
  async init({ projectDir }: TemplateEngineProps): Promise<TemplateEngine> {
    return new EjsTemplateEngine({
      projectDir,
      logger: this.#logger,
    })
  }
}
