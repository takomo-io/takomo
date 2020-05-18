export const deployOrganizationCommandIamPolicy = (): string => `
Statement:
  - Effect: Allow
    Action:
      - organizations:ListRoots
      - organizations:ListTargetsForPolicy
      - organizations:DisableAWSServiceAccess
      - organizations:DeletePolicy
      - organizations:DeleteOrganizationalUnit
      - organizations:DisablePolicyType
      - organizations:ListAWSServiceAccessForOrganization
      - organizations:DescribePolicy
      - organizations:ListPolicies
      - organizations:ListAccountsForParent
      - organizations:ListAccounts
      - organizations:EnableAWSServiceAccess
      - organizations:UpdateOrganizationalUnit
      - organizations:DescribeOrganization
      - organizations:UpdatePolicy
      - organizations:EnablePolicyType
      - organizations:AttachPolicy
      - organizations:ListOrganizationalUnitsForParent
      - organizations:CreateOrganizationalUnit
      - organizations:MoveAccount
      - organizations:CreatePolicy
    Resource: "*"
`
