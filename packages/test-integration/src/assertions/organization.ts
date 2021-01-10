import { AccountId, OrganizationFeatureSet } from "@takomo/aws-model"
import {
  AccountsOperationOutput,
  CreateAccountAliasOutput,
  CreateOrganizationOutput,
  DeleteAccountAliasOutput,
  DeployOrganizationOutput,
  DescribeOrganizationOutput,
  ListAccountsOutput,
} from "@takomo/organization-commands"

export interface CreateAccountAliasOutputMatcher {
  expectCommandToSucceed: () => CreateAccountAliasOutputMatcher
  assert: () => Promise<CreateAccountAliasOutput>
}

export const createCreateAccountAliasOutputMatcher = (
  executor: () => Promise<CreateAccountAliasOutput>,
  outputAssertions?: (output: CreateAccountAliasOutput) => void,
): CreateAccountAliasOutputMatcher => {
  const expectCommandToSucceed = () =>
    createCreateAccountAliasOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<CreateAccountAliasOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    return output
  }

  return {
    expectCommandToSucceed,
    assert,
  }
}

export interface DeleteAccountAliasOutputMatcher {
  expectCommandToSucceed: () => DeleteAccountAliasOutputMatcher
  assert: () => Promise<DeleteAccountAliasOutput>
}

export const createDeleteAccountAliasOutputMatcher = (
  executor: () => Promise<DeleteAccountAliasOutput>,
  outputAssertions?: (output: DeleteAccountAliasOutput) => void,
): DeleteAccountAliasOutputMatcher => {
  const expectCommandToSucceed = () =>
    createDeleteAccountAliasOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<CreateAccountAliasOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    return output
  }

  return {
    expectCommandToSucceed,
    assert,
  }
}

export interface DescribeOrganizationOutputMatcher {
  expectCommandToSucceed: () => DescribeOrganizationOutputMatcher
  assert: () => Promise<DescribeOrganizationOutput>
}

export const createDescribeOrganizationOutputMatcher = (
  executor: () => Promise<DescribeOrganizationOutput>,
  outputAssertions?: (output: DescribeOrganizationOutput) => void,
): DescribeOrganizationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createDescribeOrganizationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<DescribeOrganizationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    return output
  }

  return {
    expectCommandToSucceed,
    assert,
  }
}

interface ExpectCreateOrganizationOutputProps {
  readonly featureSet: OrganizationFeatureSet
  readonly masterAccountId: AccountId
}

export interface CreateOrganizationOutputMatcher {
  expectCommandToSucceed: () => CreateOrganizationOutputMatcher
  assert: (
    props: ExpectCreateOrganizationOutputProps,
  ) => Promise<CreateOrganizationOutput>
}

export const createCreateOrganizationOutputMatcher = (
  executor: () => Promise<CreateOrganizationOutput>,
  outputAssertions?: (output: CreateOrganizationOutput) => void,
): CreateOrganizationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createCreateOrganizationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async ({
    featureSet,
    masterAccountId,
  }: ExpectCreateOrganizationOutputProps): Promise<
    CreateOrganizationOutput
  > => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    expect(output.organization?.featureSet).toEqual(featureSet)
    expect(output.organization?.masterAccountId).toEqual(masterAccountId)

    return output
  }

  return {
    expectCommandToSucceed,
    assert,
  }
}

export interface ListAccountsOutputMatcher {
  expectCommandToSucceed: () => ListAccountsOutputMatcher
  assert: () => Promise<ListAccountsOutput>
}

export const createListAccountsOutputMatcher = (
  executor: () => Promise<ListAccountsOutput>,
  outputAssertions?: (output: ListAccountsOutput) => void,
): ListAccountsOutputMatcher => {
  const expectCommandToSucceed = () =>
    createListAccountsOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<ListAccountsOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    return output
  }

  return {
    expectCommandToSucceed,
    assert,
  }
}

export interface AccountsOperationOutputMatcher {
  expectCommandToSucceed: () => AccountsOperationOutputMatcher
  assert: () => Promise<AccountsOperationOutput>
}

export const createAccountsOperationOutputMatcher = (
  executor: () => Promise<AccountsOperationOutput>,
  outputAssertions?: (output: AccountsOperationOutput) => void,
): AccountsOperationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createAccountsOperationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<AccountsOperationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    return output
  }

  return {
    expectCommandToSucceed,
    assert,
  }
}

export interface DeployOrganizationOutputMatcher {
  expectCommandToSucceed: () => DeployOrganizationOutputMatcher
  assert: () => Promise<DeployOrganizationOutput>
}

export const createDeployOrganizationOutputMatcher = (
  executor: () => Promise<DeployOrganizationOutput>,
  outputAssertions?: (output: DeployOrganizationOutput) => void,
): DeployOrganizationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createDeployOrganizationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<DeployOrganizationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    return output
  }

  return {
    expectCommandToSucceed,
    assert,
  }
}
