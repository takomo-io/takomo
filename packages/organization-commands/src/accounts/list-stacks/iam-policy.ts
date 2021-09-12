export const listAccountsStacksCommandIamPolicy = (): string => `
Statement:

  # IAM permissions required for the organization master account.
  - Action:
      - organizations:DescribeOrganization
      - organizations:DescribePolicy
      - organizations:ListAWSServiceAccessForOrganization
      - organizations:ListAccounts
      - organizations:ListAccountsForParent
      - organizations:ListOrganizationalUnitsForParent
      - organizations:ListPolicies
      - organizations:ListRoots
      - organizations:ListTargetsForPolicy
    Effect: Allow
    Resource: '*'
    Sid: organizations
  - Action:
      - sts:AssumeRole
    Effect: Allow
    Resource: '*'
    Sid: sts
    
  # IAM permissions required in each organization account.
  - Sid: IAM
    Effect: Allow
    Action:
      - sts:AssumeRole
      - cloudformation:ListStacks
    Resource: "*"  
`
