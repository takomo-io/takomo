import { OrganizationPolicyType } from "@takomo/aws-model"
import { OrgEntityPoliciesConfig } from "@takomo/organization-config"
import { OrganizationState } from "@takomo/organization-context"
import { createConsoleLogger } from "@takomo/util"
import { PolicyName } from "aws-sdk/clients/organizations"
import { mock } from "jest-mock-extended"
import { EnabledPoliciesPlan } from "../../../src/common/plan/basic-config/model"
import {
  createOrgEntityPoliciesPlanForExistingEntity,
  createOrgEntityPoliciesPlanForNewEntity,
} from "../../../src/common/plan/organizational-units/create-org-entity-policies-plan"
import { OrgEntityPoliciesPlan } from "../../../src/common/plan/organizational-units/model"

const logger = createConsoleLogger({
  logLevel: "info",
})

type MockOrgEntityPolicies = {
  attached?: PolicyName[]
  inherited?: PolicyName[]
}

type MockLocalConfig = {
  serviceControl?: MockOrgEntityPolicies
  tag?: MockOrgEntityPolicies
  backup?: MockOrgEntityPolicies
  aiServicesOptOut?: MockOrgEntityPolicies
}

type MockPolicies = {
  inherited?: PolicyName[]
  attached?: PolicyName[]
}

type MockState = {
  serviceControl?: MockPolicies
  tag?: MockPolicies
  backup?: MockPolicies
  aiServicesOptOut?: MockPolicies
}

type MockEnabledPoliciesPlan = {
  add?: OrganizationPolicyType[]
  remove?: OrganizationPolicyType[]
  retain?: OrganizationPolicyType[]
}

type MockPolicyOperations = {
  retain?: PolicyName[]
  add?: PolicyName[]
  remove?: PolicyName[]
}

type MockPolicyOperationsPlan = {
  attached?: MockPolicyOperations
  inherited?: MockPolicyOperations
}

type MockPlan = {
  hasChanges: boolean
  serviceControl?: MockPolicyOperationsPlan
  tag?: MockPolicyOperationsPlan
  aiServicesOptOut?: MockPolicyOperationsPlan
  backup?: MockPolicyOperationsPlan
}

class AssertionsBuilder {
  readonly #localConfig: OrgEntityPoliciesConfig
  readonly #enabledPolicies: EnabledPoliciesPlan
  readonly #organizationState: OrganizationState
  readonly #entityId: string

  constructor(
    localConfig: OrgEntityPoliciesConfig,
    organizationState: OrganizationState,
    entityId: string,
    enabledPolicies: EnabledPoliciesPlan,
  ) {
    this.#localConfig = localConfig
    this.#enabledPolicies = enabledPolicies
    this.#organizationState = organizationState
    this.#entityId = entityId
  }

  #thenExpectPlanToBe = (mockPlan: MockPlan, existing: boolean): void => {
    const expectedPlan: OrgEntityPoliciesPlan = {
      hasChanges: mockPlan.hasChanges,
      serviceControl: {
        inherited: {
          add: mockPlan?.serviceControl?.inherited?.add || [],
          remove: mockPlan?.serviceControl?.inherited?.remove || [],
          retain: mockPlan?.serviceControl?.inherited?.retain || [],
        },
        attached: {
          add: mockPlan?.serviceControl?.attached?.add || [],
          remove: mockPlan?.serviceControl?.attached?.remove || [],
          retain: mockPlan?.serviceControl?.attached?.retain || [],
        },
      },
      tag: {
        inherited: {
          add: mockPlan?.tag?.inherited?.add || [],
          remove: mockPlan?.tag?.inherited?.remove || [],
          retain: mockPlan?.tag?.inherited?.retain || [],
        },
        attached: {
          add: mockPlan?.tag?.attached?.add || [],
          remove: mockPlan?.tag?.attached?.remove || [],
          retain: mockPlan?.tag?.attached?.retain || [],
        },
      },
      aiServicesOptOut: {
        inherited: {
          add: mockPlan?.aiServicesOptOut?.inherited?.add || [],
          remove: mockPlan?.aiServicesOptOut?.inherited?.remove || [],
          retain: mockPlan?.aiServicesOptOut?.inherited?.retain || [],
        },
        attached: {
          add: mockPlan?.aiServicesOptOut?.attached?.add || [],
          remove: mockPlan?.aiServicesOptOut?.attached?.remove || [],
          retain: mockPlan?.aiServicesOptOut?.attached?.retain || [],
        },
      },
      backup: {
        inherited: {
          add: mockPlan?.backup?.inherited?.add || [],
          remove: mockPlan?.backup?.inherited?.remove || [],
          retain: mockPlan?.backup?.inherited?.retain || [],
        },
        attached: {
          add: mockPlan?.backup?.attached?.add || [],
          remove: mockPlan?.backup?.attached?.remove || [],
          retain: mockPlan?.backup?.attached?.retain || [],
        },
      },
    }

    const plan = existing
      ? createOrgEntityPoliciesPlanForExistingEntity(
          logger,
          this.#entityId,
          this.#localConfig,
          this.#organizationState,
          this.#enabledPolicies,
        )
      : createOrgEntityPoliciesPlanForNewEntity(
          logger,
          this.#localConfig,
          this.#enabledPolicies,
        )

    expect(plan).toStrictEqual(expectedPlan)
  }

  thenExpectPlanForExistingEntityToBe = (mockPlan: MockPlan): void => {
    this.#thenExpectPlanToBe(mockPlan, true)
  }

  thenExpectPlanForNewEntityToBe = (mockPlan: MockPlan): void => {
    this.#thenExpectPlanToBe(mockPlan, false)
  }
}

class MockEnabledPoliciesPlanBuilder {
  readonly #localConfig: OrgEntityPoliciesConfig
  readonly #organizationState: OrganizationState
  readonly #entityId: string

  constructor(
    localConfig: OrgEntityPoliciesConfig,
    organizationState: OrganizationState,
    entityId: string,
  ) {
    this.#localConfig = localConfig
    this.#organizationState = organizationState
    this.#entityId = entityId
  }

  andWithoutEnabledPolicies = (): AssertionsBuilder =>
    new AssertionsBuilder(
      this.#localConfig,
      this.#organizationState,
      this.#entityId,
      { add: [], remove: [], retain: [] },
    )

  andEnabledPolicies = (
    mockEnabledPolicies: MockEnabledPoliciesPlan,
  ): AssertionsBuilder => {
    const enabledPolicies = {
      add: mockEnabledPolicies.add || [],
      remove: mockEnabledPolicies.remove || [],
      retain: mockEnabledPolicies.retain || [],
    }

    return new AssertionsBuilder(
      this.#localConfig,
      this.#organizationState,
      this.#entityId,
      enabledPolicies,
    )
  }
}

class MockEntityStateBuilder {
  readonly #localConfig: OrgEntityPoliciesConfig
  constructor(localConfig: OrgEntityPoliciesConfig) {
    this.#localConfig = localConfig
  }

  andCurrentState = (mockState: MockState): MockEnabledPoliciesPlanBuilder => {
    const entityId = "123"
    const state = mock<OrganizationState>()

    const attached = new Map([
      ["SERVICE_CONTROL_POLICY", mockState.serviceControl?.attached || []],
      ["BACKUP_POLICY", mockState.backup?.attached || []],
      ["TAG_POLICY", mockState.tag?.attached || []],
      ["AISERVICES_OPT_OUT_POLICY", mockState.aiServicesOptOut?.attached || []],
    ])

    const inherited = new Map([
      ["SERVICE_CONTROL_POLICY", mockState.serviceControl?.inherited || []],
      ["BACKUP_POLICY", mockState.backup?.inherited || []],
      ["TAG_POLICY", mockState.tag?.inherited || []],
      [
        "AISERVICES_OPT_OUT_POLICY",
        mockState.aiServicesOptOut?.inherited || [],
      ],
    ])

    const organizationPolicyTypes: OrganizationPolicyType[] = [
      "SERVICE_CONTROL_POLICY",
      "BACKUP_POLICY",
      "TAG_POLICY",
      "AISERVICES_OPT_OUT_POLICY",
    ]

    organizationPolicyTypes.forEach((policyType) => {
      state.getPoliciesAttachedToTarget
        .calledWith(policyType, entityId)
        .mockReturnValue(attached.get(policyType) || [])

      state.getPoliciesInheritedByTarget
        .calledWith(policyType, entityId)
        .mockReturnValue(inherited.get(policyType) || [])
    })

    return new MockEnabledPoliciesPlanBuilder(
      this.#localConfig,
      state,
      entityId,
    )
  }

  andEmptyCurrentState = (): MockEnabledPoliciesPlanBuilder =>
    this.andCurrentState({})
}

export const givenlocalConfig = (
  m: MockLocalConfig,
): MockEntityStateBuilder => {
  return new MockEntityStateBuilder({
    serviceControl: {
      attached: m.serviceControl?.attached || [],
      inherited: m.serviceControl?.inherited || [],
    },
    backup: {
      attached: m.backup?.attached || [],
      inherited: m.backup?.inherited || [],
    },
    tag: {
      attached: m.tag?.attached || [],
      inherited: m.tag?.inherited || [],
    },
    aiServicesOptOut: {
      attached: m.aiServicesOptOut?.attached || [],
      inherited: m.aiServicesOptOut?.inherited || [],
    },
  })
}

export const givenEmptyLocalConfig = (): MockEntityStateBuilder =>
  givenlocalConfig({})
