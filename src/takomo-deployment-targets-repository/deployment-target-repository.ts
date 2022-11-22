import Joi from "joi"
import { createDeploymentTargetsSchemas } from "../schema/deployment-targets-schema"
import { CredentialManager } from "../takomo-aws-clients"
import { Region } from "../takomo-aws-model"
import {
  Cache,
  DeploymentTargetRepositoryConfig,
  InternalCommandContext,
} from "../takomo-core"
import { DeploymentTargetConfig } from "../takomo-deployment-targets-config"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
} from "../takomo-deployment-targets-model"
import { TkmLogger } from "../utils/logging"
import { TemplateEngine } from "../utils/templating"

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
  readonly ctx: InternalCommandContext
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
