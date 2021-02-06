import { AccountRepositoryType } from "@takomo/core"
import { TakomoError } from "@takomo/util"
import {
  AccountRepository,
  AccountRepositoryProvider,
  InitAccountRepositoryProps,
} from "./account-repository"

export interface AccountRepositoryRegistry {
  readonly initAccountRepository: (
    props: InitAccountRepositoryProps,
  ) => Promise<AccountRepository>
  readonly registerAccountRepositoryProvider: (
    type: AccountRepositoryType,
    provider: AccountRepositoryProvider,
  ) => void
}

export const createAccountRepositoryRegistry = (): AccountRepositoryRegistry => {
  const providers = new Map<AccountRepositoryType, AccountRepositoryProvider>()
  return {
    registerAccountRepositoryProvider: (
      type: AccountRepositoryType,
      provider: AccountRepositoryProvider,
    ): void => {
      if (providers.has(type)) {
        throw new TakomoError(
          `Account repository provider already registered for type '${type}'`,
        )
      }

      providers.set(type, provider)
    },

    initAccountRepository: ({
      ctx,
      config,
      logger,
      templateEngine,
    }: InitAccountRepositoryProps): Promise<AccountRepository> => {
      const provider = providers.get(config.type)
      if (!provider) {
        throw new TakomoError(
          `Unknown account repository type: '${config.type}'`,
        )
      }

      return provider.initAccountRepository({
        ctx,
        config,
        templateEngine,
        logger,
      })
    },
  }
}
