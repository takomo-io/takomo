import { TkmLogger } from "../../utils/logging"
import { TemplateEngine } from "../template-engine"
import {
  TemplateEngineProps,
  TemplateEngineProvider,
} from "../template-engine-provider"
import { EjsTemplateEngine } from "./ejs-template-engine"

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
