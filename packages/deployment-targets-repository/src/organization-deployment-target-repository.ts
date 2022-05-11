import { OrganizationsClient } from "@takomo/aws-clients"
import { Account } from "@takomo/aws-model"
import { TakomoError } from "@takomo/util"
import {
  DeploymentTargetConfigItemWrapper,
  DeploymentTargetRepository,
  DeploymentTargetRepositoryProvider,
} from "./deployment-target-repository"

const buildDeploymentTargetName = ({ name, id }: Account) =>
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

const loadTargetsFromOUHierarchy = async (
  client: OrganizationsClient,
  inferDeploymentTargetNameFromAccountName: boolean,
): Promise<ReadonlyArray<DeploymentTargetConfigItemWrapper>> => {
  const ous = await client.listOrganizationalUnits()
  const deploymentTargets = await Promise.all(
    ous.map(async (ou) => {
      const accounts = await client.listAccountsForOU(ou.id)
      const targets: ReadonlyArray<DeploymentTargetConfigItemWrapper> =
        accounts.map((a) => ({
          source: "aws organization",
          item: {
            name: inferDeploymentTargetNameFromAccountName
              ? buildDeploymentTargetName(a)
              : a.id,
            status: "active",
            labels: [],
            deploymentGroupPath: ou.path,
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

const loadTargetsFromAccounts = async (
  client: OrganizationsClient,
  inferDeploymentTargetNameFromAccountName: boolean,
): Promise<ReadonlyArray<DeploymentTargetConfigItemWrapper>> => {
  const accounts = await client.listAccounts()
  return accounts.map((a) => ({
    source: "aws organization",
    item: {
      name: inferDeploymentTargetNameFromAccountName
        ? buildDeploymentTargetName(a)
        : a.id,
      status: "active",
      labels: [],
      deploymentGroupPath: "ROOT",
      vars: {},
      bootstrapConfigSets: [],
      configSets: [],
      accountId: a.id,
    },
  }))
}

const loadTargets = async (
  client: OrganizationsClient,
  inferDeploymentGroupPathFromOUPath: boolean,
  inferDeploymentTargetNameFromAccountName: boolean,
): Promise<ReadonlyArray<DeploymentTargetConfigItemWrapper>> => {
  if (inferDeploymentGroupPathFromOUPath) {
    return loadTargetsFromOUHierarchy(
      client,
      inferDeploymentTargetNameFromAccountName,
    )
  }

  return loadTargetsFromAccounts(
    client,
    inferDeploymentTargetNameFromAccountName,
  )
}

export const createOrganizationDeploymentTargetRepositoryProvider =
  (): DeploymentTargetRepositoryProvider => {
    return {
      initDeploymentTargetRepository: async ({
        logger,
        ctx,
        config,
        credentialManager,
      }): Promise<DeploymentTargetRepository> => {
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

        if (organizationReaderRoleArn) {
          logger.debug(
            `Load deployment targets from AWS organization using role ${organizationReaderRoleArn}`,
          )
        } else {
          logger.debug("Load deployment targets from AWS organization")
        }

        const cm = organizationReaderRoleArn
          ? await credentialManager.createCredentialManagerForRole(
              organizationReaderRoleArn as string,
            )
          : credentialManager

        const client = await ctx.awsClientProvider.createOrganizationsClient({
          logger,
          id: "organizations",
          region: "us-east-1",
          credentialProvider: cm.getCredentialProvider(),
        })

        const deploymentTargets = await loadTargets(
          client,
          inferDeploymentGroupPathFromOUPath,
          inferDeploymentTargetNameFromAccountName,
        )

        logger.debug(
          `Loaded ${deploymentTargets.length} deployment targets from AWS organization`,
        )

        return {
          listDeploymentTargets: async (): Promise<
            ReadonlyArray<DeploymentTargetConfigItemWrapper>
          > => deploymentTargets.flat().slice(),
        }
      },
    }
  }
