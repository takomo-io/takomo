import { TakomoConfig, TakomoConfigProvider } from "../../../dist/index.js"
import { testingCustomPartialStackHandler } from "../../src/custom-stacks/testing-custom-partial-stack-handler.js"

const provider: TakomoConfigProvider = async (): Promise<TakomoConfig> => {
  return {
    customStackHandlers: [testingCustomPartialStackHandler],
  }
}

export default provider
