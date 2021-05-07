import { Region } from "@takomo/aws-model"
import { AccountRepositoryConfig, CommandContext } from "@takomo/core"
import { OrganizationAccountConfig } from "@takomo/organization-config"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { createOrganizationSchemas } from "@takomo/organization-schema"
import { TemplateEngine, TkmLogger } from "@takomo/util"
import Joi from "joi"

export interface AccountConfigItem extends Partial<OrganizationAccountConfig> {
  readonly organizationalUnitPath: OrganizationalUnitPath
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
}

export const createAccountConfigItemSchema = (
  props: CreateAccountConfigItemSchemaProps,
): Joi.ObjectSchema => {
  const {
    organizationalUnitPath,
    organizationAccount,
  } = createOrganizationSchemas(props)

  return organizationAccount.keys({
    organizationalUnitPath: organizationalUnitPath.required(),
  })
}
