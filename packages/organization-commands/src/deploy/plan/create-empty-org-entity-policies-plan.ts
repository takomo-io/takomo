import { OrgEntityPoliciesPlan, OrgEntityPolicyOperationsPlan } from "./model"

const emptyOrgEntityPolicyOperationsPlan = (): OrgEntityPolicyOperationsPlan => ({
  attached: {
    add: [],
    retain: [],
    remove: [],
  },
  inherited: {
    add: [],
    retain: [],
    remove: [],
  },
})

export const createEmptyOrgEntityPoliciesPlan = (): OrgEntityPoliciesPlan => ({
  hasChanges: false,
  serviceControl: emptyOrgEntityPolicyOperationsPlan(),
  tag: emptyOrgEntityPolicyOperationsPlan(),
  aiServicesOptOut: emptyOrgEntityPolicyOperationsPlan(),
  backup: emptyOrgEntityPolicyOperationsPlan(),
})
