import { givenEmptyLocalConfig, givenlocalConfig } from "./helpers"

describe("#createOrgEntityPoliciesPlanForNewEntity", () => {
  // Test case where a new organizational entity (OU or account) is added.
  // All policy types are disabled.
  test("when a new entity is added #1", () => {
    givenEmptyLocalConfig()
      .andEmptyCurrentState()
      .andWithoutEnabledPolicies()
      .thenExpectPlanForNewEntityToBe({ hasChanges: false })
  })

  // Test case where a new organizational entity (OU or account) is added.
  // It inherits FullAWSAccess service control policy.
  test("when a new entity is added #2", () => {
    givenlocalConfig({
      serviceControl: {
        attached: [],
        inherited: ["FullAWSAccess"],
      },
    })
      .andEmptyCurrentState()
      .andEnabledPolicies({ retain: ["SERVICE_CONTROL_POLICY"] })
      .thenExpectPlanForNewEntityToBe({
        hasChanges: true,
        serviceControl: {
          inherited: {
            add: ["FullAWSAccess"],
            remove: [],
            retain: [],
          },
          attached: {
            add: ["FullAWSAccess"],
            remove: [],
            retain: [],
          },
        },
      })
  })

  // Test case where a new organizational entity (OU or account) is added.
  // It inherits FullAWSAccess service control policy and attaches AllowedRegions.
  test("when a new entity is added #3", () => {
    givenlocalConfig({
      serviceControl: {
        attached: ["AllowedRegions"],
        inherited: ["FullAWSAccess"],
      },
    })
      .andEmptyCurrentState()
      .andEnabledPolicies({ retain: ["SERVICE_CONTROL_POLICY"] })
      .thenExpectPlanForNewEntityToBe({
        hasChanges: true,
        serviceControl: {
          inherited: {
            add: ["FullAWSAccess"],
            remove: [],
            retain: [],
          },
          attached: {
            add: ["AllowedRegions", "FullAWSAccess"],
            remove: [],
            retain: [],
          },
        },
      })
  })

  // Test case where a new organizational entity (OU or account) is added.
  // It inherits Example service control policy and RDS backup policy.
  test("when a new entity is added #4", () => {
    givenlocalConfig({
      serviceControl: {
        attached: [],
        inherited: ["Example"],
      },
      backup: {
        attached: [],
        inherited: ["RDS"],
      },
    })
      .andEmptyCurrentState()
      .andEnabledPolicies({
        retain: ["SERVICE_CONTROL_POLICY", "BACKUP_POLICY"],
      })
      .thenExpectPlanForNewEntityToBe({
        hasChanges: true,
        serviceControl: {
          inherited: {
            add: ["Example"],
            remove: [],
            retain: [],
          },
          attached: {
            add: ["Example"],
            remove: [],
            retain: [],
          },
        },
        backup: {
          inherited: {
            add: ["RDS"],
            remove: [],
            retain: [],
          },
          attached: {
            add: [],
            remove: [],
            retain: [],
          },
        },
      })
  })
})
