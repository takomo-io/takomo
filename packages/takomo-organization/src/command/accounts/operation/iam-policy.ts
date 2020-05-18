export const accountsDeployOperationCommandIamPolicy = (): string => `
Statement: 
  - Effect: Allow
    Action:
      - organizations:ListRoots
      - organizations:ListTargetsForPolicy
      - organizations:ListAWSServiceAccessForOrganization
      - organizations:DescribePolicy
      - organizations:ListPolicies
      - organizations:ListAccountsForParent
      - organizations:ListAccounts
      - organizations:DescribeOrganization
      - organizations:ListOrganizationalUnitsForParent
    Resource: "*"
    
    # IAM permissions needed to assume role from the target accounts.
    # Specify resource to restrict access to specific roles.  
    - Sid: IAM
      Effect: Allow
      Action:
        - sts:AssumeRole
      Resource: "*"
`

export const accountsUndeployOperationCommandIamPolicy = (): string => `
Statement: 
  - Effect: Allow
    Action:
      - organizations:ListRoots
      - organizations:ListTargetsForPolicy
      - organizations:ListAWSServiceAccessForOrganization
      - organizations:DescribePolicy
      - organizations:ListPolicies
      - organizations:ListAccountsForParent
      - organizations:ListAccounts
      - organizations:DescribeOrganization
      - organizations:ListOrganizationalUnitsForParent
    Resource: "*"
    
    # IAM permissions needed to assume role from the target accounts.
    # Specify resource to restrict access to specific roles.  
    - Sid: IAM
      Effect: Allow
      Action:
        - sts:AssumeRole
      Resource: "*"
`
