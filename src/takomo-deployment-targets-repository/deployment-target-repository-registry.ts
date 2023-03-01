import { DeploymentTargetRepositoryType } from "../config/project-config.js"
import { TakomoError } from "../utils/errors.js"
import {
  DeploymentTargetRepository,
  DeploymentTargetRepositoryProvider,
  InitDeploymentTargetRepositoryProps,
} from "./deployment-target-repository.js"

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

    const registerDeploymentTargetRepositoryProvider = (
      type: DeploymentTargetRepositoryType,
      provider: DeploymentTargetRepositoryProvider,
    ): void => {
      if (providers.has(type)) {
        throw new TakomoError(
          `Deployment target repository provider already registered for type '${type}'`,
        )
      }

      providers.set(type, provider)
    }

    const initDeploymentTargetRepository = ({
      ctx,
      config,
      logger,
      templateEngine,
      credentialManager,
      cache,
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
        credentialManager,
        cache,
      })
    }

    return {
      registerDeploymentTargetRepositoryProvider,
      initDeploymentTargetRepository,
    }
  }
