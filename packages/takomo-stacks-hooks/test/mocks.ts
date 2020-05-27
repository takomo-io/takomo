import { TakomoCredentialProvider } from "@takomo/core"
import { mock } from "jest-mock-extended"

export const mockTakomoCredentialProvider = () =>
  mock<TakomoCredentialProvider>()
