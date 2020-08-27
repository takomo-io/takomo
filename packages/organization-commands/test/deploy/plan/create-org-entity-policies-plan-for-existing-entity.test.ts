import { Constants } from "@takomo/core"
import { givenEmptyLocalConfig, givenlocalConfig } from "./helpers"

describe("#createOrgEntityPoliciesPlanForExistingEntity", () => {
  // Test case where an existing organizational entity (OU or account) is updated.
  // All policy types are disabled. Currently the entity has no inherited nor attached policies.
  test("when an existing entity is updated #1", () => {
    givenEmptyLocalConfig()
      .andEmptyCurrentState()
      .andWithoutEnabledPolicies()
      .thenExpectPlanForExistingEntityToBe({ hasChanges: false })
  })

  // Test case where an existing organizational entity (OU or account) is updated.
  // Currently the entity has no inherited nor attached policies. In local configuration it
  // inherits FullAWSAccess service control policy.
  test("when an existing entity is updated #2", () => {
    givenlocalConfig({
      serviceControl: {
        inherited: ["FullAWSAccess"],
      },
    })
      .andEmptyCurrentState()
      .andEnabledPolicies({ retain: [Constants.SERVICE_CONTROL_POLICY_TYPE] })
      .thenExpectPlanForExistingEntityToBe({
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

  // Test case where an existing organizational entity (OU or account) is updated.
  // Currently the entity has no inherited nor attached policies. In local configuration it
  // inherits FullAWSAccess service control policy and attaches Example service control policy
  test("when an existing entity is updated #3", () => {
    givenlocalConfig({
      serviceControl: {
        attached: ["Example"],
        inherited: ["FullAWSAccess"],
      },
    })
      .andEmptyCurrentState()
      .andEnabledPolicies({ retain: [Constants.SERVICE_CONTROL_POLICY_TYPE] })
      .thenExpectPlanForExistingEntityToBe({
        hasChanges: true,
        serviceControl: {
          inherited: {
            add: ["FullAWSAccess"],
            remove: [],
            retain: [],
          },
          attached: {
            add: ["Example", "FullAWSAccess"],
            remove: [],
            retain: [],
          },
        },
      })
  })

  // Test case where an existing organizational entity (OU or account) is updated.
  // Currently the entity inherits FullAWSAccess and attaches Example. In local configuration it
  // inherits FullAWSAccess service control policy and attaches Example service control policy
  test("when an existing entity is updated #4", () => {
    givenlocalConfig({
      serviceControl: {
        attached: ["Example"],
        inherited: ["FullAWSAccess"],
      },
    })
      .andCurrentState({
        serviceControl: {
          inherited: ["FullAWSAccess"],
          attached: ["Example", "FullAWSAccess"],
        },
      })
      .andEnabledPolicies({
        retain: [Constants.SERVICE_CONTROL_POLICY_TYPE],
      })
      .thenExpectPlanForExistingEntityToBe({
        hasChanges: false,
        serviceControl: {
          inherited: {
            add: [],
            remove: [],
            retain: ["FullAWSAccess"],
          },
          attached: {
            add: [],
            remove: [],
            retain: ["Example", "FullAWSAccess"],
          },
        },
      })
  })

  // Test case where an existing organizational entity (OU or account) is updated.
  // Currently the entity inherits FullAWSAccess and attaches Example.
  // In local configuration service control policy is disabled.
  test("when an existing entity is updated #5", () => {
    givenEmptyLocalConfig()
      .andCurrentState({
        serviceControl: {
          inherited: ["FullAWSAccess"],
          attached: ["Example", "FullAWSAccess"],
        },
      })
      .andWithoutEnabledPolicies()
      .thenExpectPlanForExistingEntityToBe({
        hasChanges: true,
        serviceControl: {
          inherited: {
            add: [],
            remove: ["FullAWSAccess"],
            retain: [],
          },
          attached: {
            add: [],
            remove: ["Example", "FullAWSAccess"],
            retain: [],
          },
        },
      })
  })

  // Test case where an existing organizational entity (OU or account) is updated.
  // Currently the entity inherits FullAWSAccess. In local configuration, there are
  // no changes to the current service control policies, but the entity attaches
  // one tag and backup policy.
  test("when an existing entity is updated #5", () => {
    givenlocalConfig({
      serviceControl: {
        inherited: ["FullAWSAccess"],
      },
      backup: {
        attached: ["MyBackup"],
      },
      tag: {
        attached: ["MyTag"],
      },
    })
      .andCurrentState({
        serviceControl: {
          inherited: ["FullAWSAccess"],
          attached: ["FullAWSAccess"],
        },
      })
      .andEnabledPolicies({
        retain: [
          Constants.TAG_POLICY_TYPE,
          Constants.SERVICE_CONTROL_POLICY_TYPE,
          Constants.BACKUP_POLICY_TYPE,
        ],
      })
      .thenExpectPlanForExistingEntityToBe({
        hasChanges: true,
        serviceControl: {
          inherited: {
            retain: ["FullAWSAccess"],
          },
          attached: {
            retain: ["FullAWSAccess"],
          },
        },
        backup: {
          attached: {
            add: ["MyBackup"],
          },
        },
        tag: {
          attached: {
            add: ["MyTag"],
          },
        },
      })
  })

  // Test case where an existing organizational entity (OU or account) is updated.
  // Currently the entity inherits FullAWSAccess and FooBar. In local configuration,
  // In local configuration, FooBar is directly attached to the entity but no longer
  // inherited.
  test("when an existing entity is updated #6", () => {
    givenlocalConfig({
      serviceControl: {
        inherited: ["FullAWSAccess"],
        attached: ["FullAWSAccess", "FooBar"],
      },
    })
      .andCurrentState({
        serviceControl: {
          inherited: ["FullAWSAccess", "FooBar"],
          attached: ["FullAWSAccess", "FooBar"],
        },
      })
      .andEnabledPolicies({
        retain: [Constants.SERVICE_CONTROL_POLICY_TYPE],
      })
      .thenExpectPlanForExistingEntityToBe({
        hasChanges: true,
        serviceControl: {
          attached: {
            retain: ["FullAWSAccess", "FooBar"],
          },
          inherited: {
            retain: ["FullAWSAccess"],
            remove: ["FooBar"],
          },
        },
      })
  })
})
