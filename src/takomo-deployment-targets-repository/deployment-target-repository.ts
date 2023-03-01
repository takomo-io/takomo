import Joi from "joi"
import { CredentialManager } from "../aws/common/credentials.js"
import { Region } from "../aws/common/model.js"
import { Cache } from "../caches/cache.js"
import { DeploymentTargetRepositoryConfig } from "../config/project-config.js"
import { DeploymentTargetConfig } from "../config/targets-config.js"
import { InternalCommandContext } from "../context/command-context.js"
import { createDeploymentTargetsSchemas } from "../schema/deployment-targets-schema.js"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
} from "../targets/targets-model.js"
import { TemplateEngine } from "../templating/template-engine.js"
import { TkmLogger } from "../utils/logging.js"

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
