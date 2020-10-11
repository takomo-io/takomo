import { TakomoCredentialProvider } from "@takomo/core"
import { Stack } from "@takomo/stacks-model"

export const collectCredentialProviders = (
  stacks: Stack[],
): TakomoCredentialProvider[] =>
  stacks.reduce((collected, stack) => {
    const cp = stack.getCredentialProvider()
    if (collected.some((c) => c.getName() === cp.getName())) {
      return collected
    }

    return [...collected, cp]
  }, new Array<TakomoCredentialProvider>())
