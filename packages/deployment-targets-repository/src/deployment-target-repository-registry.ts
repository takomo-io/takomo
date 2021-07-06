import { DeploymentTargetRepositoryType } from "@takomo/core"
import { TakomoError } from "@takomo/util"
import {
  DeploymentTargetRepository,
  DeploymentTargetRepositoryProvider,
  InitDeploymentTargetRepositoryProps,
} from "./deployment-target-repository"

export interface DeploymentTargetRepositoryRegistry {
  readonly initDeploymentTargetRepository: (
    props: InitDeploymentTargetRepositoryProps,
  ) => Promise<DeploymentTargetRepository>
  readonly registerDeploymentTargetRepositoryProvider: (
    type: DeploymentTargetRepositoryType,
    provider: DeploymentTargetRepositoryProvider,
  ) => void
}

export const createDeploymentTargetRepositoryRegistry =
  (): DeploymentTargetRepositoryRegistry => {
    const providers = new Map<
      DeploymentTargetRepositoryType,
      DeploymentTargetRepositoryProvider
    >()
    return {
      registerDeploymentTargetRepositoryProvider: (
        type: DeploymentTargetRepositoryType,
        provider: DeploymentTargetRepositoryProvider,
      ): void => {
        if (providers.has(type)) {
          throw new TakomoError(
            `Deployment target repository provider already registered for type '${type}'`,
          )
        }

        providers.set(type, provider)
      },

      initDeploymentTargetRepository: ({
        ctx,
        config,
        logger,
        templateEngine,
      }: InitDeploymentTargetRepositoryProps): Promise<DeploymentTargetRepository> => {
        const provider = providers.get(config.type)
        if (!provider) {
          throw new TakomoError(
            `Unknown account repository type: '${config.type}'`,
          )
        }

        return provider.initDeploymentTargetRepository({
          ctx,
          config,
          templateEngine,
          logger,
        })
      },
    }
  }
