import { TakomoCredentialProvider } from "@takomo/core"
import { Stack } from "@takomo/stacks-model"

export const collectCredentialProviders = (
  stacksToLaunch: Stack[],
): TakomoCredentialProvider[] =>
  stacksToLaunch.reduce((collected, stack) => {
    const cp = stack.getCredentialProvider()
    if (collected.find((c) => c.getName() === cp.getName())) {
      return collected
    }

    return [...collected, cp]
  }, new Array<TakomoCredentialProvider>())
