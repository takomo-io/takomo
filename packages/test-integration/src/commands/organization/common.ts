import { AccountId } from "@takomo/aws-model"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetName } from "@takomo/config-sets"
import { InternalCommandContext } from "@takomo/core"
import { OrganizationConfigRepository } from "@takomo/organization-context"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { CommandPath } from "@takomo/stacks-model"
import { createConsoleLogger } from "@takomo/util"
import { createTestCommandContext, ExecuteCommandProps } from "../common"
import {
  CreateCtxAndConfigRepositoryProps,
  CreateTestStacksConfigRepositoryProps,
} from "../stacks"

interface CtxAndConfigRepository {
  ctx: InternalCommandContext
  configRepository: OrganizationConfigRepository
}

export const createTestOrganizationConfigRepository = async ({
  ctx,
}: CreateTestStacksConfigRepositoryProps): Promise<OrganizationConfigRepository> =>
  createFileSystemOrganizationConfigRepository({
    ...ctx.filePaths,
    ctx,
    logger: createConsoleLogger({
      logLevel: ctx.logLevel,
    }),
  })

export const createCtxAndConfigRepository = async (
  props: CreateCtxAndConfigRepositoryProps,
): Promise<CtxAndConfigRepository> => {
  const ctx = await createTestCommandContext(props)
  const configRepository = await createTestOrganizationConfigRepository({ ctx })
  return {
    ctx,
    configRepository,
  }
}

export interface ExecuteAccountsOperationCommandProps
  extends ExecuteCommandProps {
  readonly accountIds?: ReadonlyArray<AccountId>
  readonly organizationalUnits?: ReadonlyArray<OrganizationalUnitPath>
  readonly concurrentAccounts?: number
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
}
