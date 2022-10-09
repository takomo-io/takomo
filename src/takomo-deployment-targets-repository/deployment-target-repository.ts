import Joi from "joi"
import { CredentialManager } from "../takomo-aws-clients"
import { Region } from "../takomo-aws-model"
import {
  Cache,
  CommandContext,
  DeploymentTargetRepositoryConfig,
} from "../takomo-core"
import { DeploymentTargetConfig } from "../takomo-deployment-targets-config"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
} from "../takomo-deployment-targets-model"
import { createDeploymentTargetsSchemas } from "../takomo-deployment-targets-schema"
import { TemplateEngine, TkmLogger } from "../takomo-util"

export interface DeploymentTargetConfigItem
  extends Partial<DeploymentTargetConfig> {
  readonly name: DeploymentTargetName
  readonly deploymentGroupPath: DeploymentGroupPath
}

export interface DeploymentTargetConfigItemWrapper {
  readonly source: unknown
  readonly item: DeploymentTargetConfigItem
}

export interface DeploymentTargetRepository {
  readonly listDeploymentTargets: () => Promise<
    ReadonlyArray<DeploymentTargetConfigItemWrapper>
  >
}

export interface InitDeploymentTargetRepositoryProps {
  readonly config: DeploymentTargetRepositoryConfig
  readonly ctx: CommandContext
  readonly templateEngine: TemplateEngine
  readonly logger: TkmLogger
  readonly credentialManager: CredentialManager
  readonly cache: Cache
}

export interface DeploymentTargetRepositoryProvider {
  readonly initDeploymentTargetRepository: (
    props: InitDeploymentTargetRepositoryProps,
  ) => Promise<DeploymentTargetRepository>
}

interface CreateDeploymentTargetConfigItemSchemaProps {
  readonly regions: ReadonlyArray<Region>
}

export const createDeploymentTargetConfigItemSchema = (
  props: CreateDeploymentTargetConfigItemSchemaProps,
): Joi.ObjectSchema => {
  const { deploymentGroupPath, deploymentTarget } =
    createDeploymentTargetsSchemas(props)

  return deploymentTarget.keys({
    deploymentGroupPath: deploymentGroupPath.required(),
  })
}
