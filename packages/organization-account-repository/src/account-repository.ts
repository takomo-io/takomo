import { AccountId, Region } from "@takomo/aws-model"
import { createAwsSchemas } from "@takomo/aws-schema"
import { AccountRepositoryConfig, CommandContext } from "@takomo/core"
import { OrganizationAccountConfig } from "@takomo/organization-config"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { createOrganizationSchemas } from "@takomo/organization-schema"
import { TemplateEngine, TkmLogger } from "@takomo/util"
import Joi from "joi"

export interface AccountConfigItem {
  readonly accountId: AccountId
  readonly organizationalUnitPath: OrganizationalUnitPath
  readonly config: Partial<OrganizationAccountConfig>
}

export interface AccountConfigItemWrapper {
  readonly source: unknown
  readonly item: AccountConfigItem
}

export interface AccountRepository {
  readonly putAccount: (item: AccountConfigItem) => Promise<void>
  readonly listAccounts: () => Promise<ReadonlyArray<AccountConfigItemWrapper>>
}

export interface InitAccountRepositoryProps {
  readonly config: AccountRepositoryConfig
  readonly ctx: CommandContext
  readonly templateEngine: TemplateEngine
  readonly logger: TkmLogger
}

export interface AccountRepositoryProvider {
  readonly initAccountRepository: (
    props: InitAccountRepositoryProps,
  ) => Promise<AccountRepository>
}

interface CreateAccountConfigItemSchemaProps {
  readonly regions: ReadonlyArray<Region>
  readonly trustedAwsServices: ReadonlyArray<string>
}

export const createAccountConfigItemSchema = (
  props: CreateAccountConfigItemSchemaProps,
): Joi.ObjectSchema => {
  const { accountId } = createAwsSchemas(props)
  const {
    organizationalUnitPath,
    organizationAccount,
  } = createOrganizationSchemas(props)

  return Joi.object({
    organizationalUnitPath: organizationalUnitPath.required(),
    accountId: accountId.required(),
    config: organizationAccount,
  })
}
