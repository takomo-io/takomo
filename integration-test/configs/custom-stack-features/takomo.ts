import { TakomoConfig, TakomoConfigProvider } from "../../../dist/index.js"
import { testingCustomStackHandler } from "../../src/custom-stacks/testing-custom-stack-handler.js"

const provider: TakomoConfigProvider = async (): Promise<TakomoConfig> => {
  return {
    customStackHandlers: [testingCustomStackHandler],
  }
}

export default provider
