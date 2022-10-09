import { OrganizationsClient } from "../takomo-aws-clients"
import { Account, OUPath } from "../takomo-aws-model"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
} from "../takomo-deployment-targets-model"
import { TakomoError } from "../takomo-util"
import {
  DeploymentTargetConfigItemWrapper,
  DeploymentTargetRepository,
  DeploymentTargetRepositoryProvider,
} from "./deployment-target-repository"

export const buildDeploymentTargetName = ({ name, id }: Account) =>
  name
    .toLowerCase()
    .replace(/[():\/]/g, "")
    .replace(/\./g, "-")
    .replace(/\s+/g, "-")
    // Target name max length is 60 characters.
    // Account id is appended to name with a hyphen.
    // Ensure name is not too long.
    .slice(0, 60 - 12 - 1) +
  "-" +
  id

export const resolveDeploymentGroupPath = (
  ouPath: OUPath,
  rootDeploymentGroupPath?: DeploymentGroupPath,
): DeploymentGroupPath =>
  rootDeploymentGroupPath
    ? ouPath.replace("ROOT", rootDeploymentGroupPath)
    : ouPath

const loadTargetsFromOUHierarchy = async ({
  source,
  client,
  inferDeploymentTargetNameFromAccountName,
  rootDeploymentGroupPath,
}: LoadTargetsProps): Promise<
  ReadonlyArray<DeploymentTargetConfigItemWrapper>
> => {
  const ous = await client.listOrganizationalUnits()
  const deploymentTargets = await Promise.all(
    ous.map(async (ou) => {
      const accounts = await client.listAccountsForOU(ou.id)
      const targets: ReadonlyArray<DeploymentTargetConfigItemWrapper> =
        accounts.map((a) => ({
          source,
          item: {
            name: resolveDeploymentTargetName(
              a,
              inferDeploymentTargetNameFromAccountName,
            ),
            status: "active",
            labels: [],
            deploymentGroupPath: resolveDeploymentGroupPath(
              ou.path,
              rootDeploymentGroupPath,
            ),
            vars: {},
            bootstrapConfigSets: [],
            configSets: [],
            accountId: a.id,
          },
        }))

      return targets
    }),
  )

  return deploymentTargets.flat()
}

export const resolveDeploymentTargetName = (
  account: Account,
  inferDeploymentTargetNameFromAccountName: boolean,
): DeploymentTargetName =>
  inferDeploymentTargetNameFromAccountName
    ? buildDeploymentTargetName(account)
    : account.id

const loadTargetsFromAccounts = async ({
  source,
  client,
  inferDeploymentTargetNameFromAccountName,
  rootDeploymentGroupPath = "ROOT",
}: LoadTargetsProps): Promise<
  ReadonlyArray<DeploymentTargetConfigItemWrapper>
> => {
  const accounts = await client.listAccounts()
  return accounts.map((a) => ({
    source,
    item: {
      name: resolveDeploymentTargetName(
        a,
        inferDeploymentTargetNameFromAccountName,
      ),
      status: "active",
      labels: [],
      deploymentGroupPath: rootDeploymentGroupPath,
      vars: {},
      bootstrapConfigSets: [],
      configSets: [],
      accountId: a.id,
    },
  }))
}

interface LoadTargetsProps {
  readonly source: string
  readonly client: OrganizationsClient
  readonly inferDeploymentGroupPathFromOUPath: boolean
  readonly inferDeploymentTargetNameFromAccountName: boolean
  readonly rootDeploymentGroupPath?: DeploymentGroupPath
}

const loadTargets = async (
  props: LoadTargetsProps,
): Promise<ReadonlyArray<DeploymentTargetConfigItemWrapper>> =>
  props.inferDeploymentGroupPathFromOUPath
    ? loadTargetsFromOUHierarchy(props)
    : loadTargetsFromAccounts(props)

export const createOrganizationDeploymentTargetRepositoryProvider =
  (): DeploymentTargetRepositoryProvider => {
    return {
      initDeploymentTargetRepository: async ({
        logger,
        ctx,
        config,
        credentialManager,
        cache,
      }): Promise<DeploymentTargetRepository> => {
        const id = config.id
        if (id === null || id === undefined) {
          throw new TakomoError(
            "Invalid deployment target repository config - 'id' property is required",
          )
        }

        if (typeof id !== "string") {
          throw new TakomoError(
            "Invalid deployment target repository config - 'id' property must be of type 'string'",
          )
        }

        const cacheKey = `deployment-target-repository/organization-${id}.v1.json`

        const organizationReaderRoleArn = config.organizationReaderRoleArn
        if (
          organizationReaderRoleArn &&
          typeof organizationReaderRoleArn !== "string"
        ) {
          throw new TakomoError(
            "Invalid deployment target repository config - 'organizationReaderRoleArn' property must be of type 'string'",
          )
        }

        const inferDeploymentGroupPathFromOUPath =
          config.inferDeploymentGroupPathFromOUPath ?? true
        if (typeof inferDeploymentGroupPathFromOUPath !== "boolean") {
          throw new TakomoError(
            "Invalid deployment target repository config - 'inferDeploymentGroupPathFromOUPath' property must be of type 'boolean'",
          )
        }

        const inferDeploymentTargetNameFromAccountName =
          config.inferDeploymentTargetNameFromAccountName ?? true
        if (typeof inferDeploymentTargetNameFromAccountName !== "boolean") {
          throw new TakomoError(
            "Invalid deployment target repository config - 'inferDeploymentTargetNameFromAccountName' property must be of type 'boolean'",
          )
        }

        const cacheEnabled = config.cache ?? false
        if (typeof cacheEnabled !== "boolean") {
          throw new TakomoError(
            "Invalid deployment target repository config - 'cache' property must be of type 'boolean'",
          )
        }

        const rootDeploymentGroupPath = config.rootDeploymentGroupPath
        if (
          rootDeploymentGroupPath &&
          typeof rootDeploymentGroupPath !== "string"
        ) {
          throw new TakomoError(
            "Invalid deployment target repository config - 'rootDeploymentGroupPath' property must be of type 'string'",
          )
        }

        const listDeploymentTargets = async (): Promise<
          ReadonlyArray<DeploymentTargetConfigItemWrapper>
        > => {
          if (cacheEnabled) {
            const cachedConfig = await cache.get(cacheKey)

            if (cachedConfig) {
              logger.info("Deployment targets found from cache")
              const deserializedConfig = JSON.parse(cachedConfig)
              return deserializedConfig as ReadonlyArray<DeploymentTargetConfigItemWrapper>
            }
          }

          if (organizationReaderRoleArn) {
            logger.info(
              `Load deployment targets from AWS organization '${id}' using role ${organizationReaderRoleArn}`,
            )
          } else {
            logger.info(`Load deployment targets from AWS organization '${id}'`)
          }

          const cm = organizationReaderRoleArn
            ? await credentialManager.createCredentialManagerForRole(
                organizationReaderRoleArn as string,
              )
            : credentialManager

          const client = await ctx.awsClientProvider.createOrganizationsClient({
            logger,
            id: `organization-${id}`,
            region: "us-east-1",
            credentialProvider: cm.getCredentialProvider(),
          })

          const deploymentTargets = await loadTargets({
            source: `organization ${id}`,
            client,
            inferDeploymentGroupPathFromOUPath,
            inferDeploymentTargetNameFromAccountName,
            rootDeploymentGroupPath:
              rootDeploymentGroupPath as DeploymentGroupPath,
          })

          logger.debug(
            `Loaded ${deploymentTargets.length} deployment targets from AWS organization '${id}'`,
          )

          const deploymentTargetsList = deploymentTargets.flat().slice()

          if (cacheEnabled) {
            await cache.put(cacheKey, JSON.stringify(deploymentTargetsList))
          }

          return deploymentTargetsList
        }

        return {
          listDeploymentTargets,
        }
      },
    }
  }
