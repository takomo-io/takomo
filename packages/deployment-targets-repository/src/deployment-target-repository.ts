import { Region } from "@takomo/aws-model"
import { CommandContext, DeploymentTargetRepositoryConfig } from "@takomo/core"
import { DeploymentTargetConfig } from "@takomo/deployment-targets-config"
import { DeploymentGroupPath } from "@takomo/deployment-targets-model"
import { createDeploymentTargetsSchemas } from "@takomo/deployment-targets-schema"
import { TemplateEngine, TkmLogger } from "@takomo/util"
import Joi from "joi"

export interface DeploymentTargetConfigItem
  extends Partial<DeploymentTargetConfig> {
  readonly deploymentGroupPath: DeploymentGroupPath
}

export interface DeploymentTargetConfigItemWrapper {
  readonly source: unknown
  readonly item: DeploymentTargetConfigItem
}

export interface DeploymentTargetRepository {
  readonly putDeploymentTarget: (
    item: DeploymentTargetConfigItem,
  ) => Promise<void>
  readonly listDeploymentTargets: () => Promise<
    ReadonlyArray<DeploymentTargetConfigItemWrapper>
  >
}

export interface InitDeploymentTargetRepositoryProps {
  readonly config: DeploymentTargetRepositoryConfig
  readonly ctx: CommandContext
  readonly templateEngine: TemplateEngine
  readonly logger: TkmLogger
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
  const {
    deploymentGroupPath,
    deploymentTarget,
  } = createDeploymentTargetsSchemas(props)

  return deploymentTarget.keys({
    deploymentGroupPath: deploymentGroupPath.required(),
  })
}
