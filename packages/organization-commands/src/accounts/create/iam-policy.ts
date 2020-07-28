export const createAccountCommandIamPolicy = (): string => `
Statement:
  - Effect: Allow
    Action:
      - organizations:DescribeOrganization
      - organizations:CreateAccount
      - organizations:DescribeCreateAccountStatus
    Resource: "*"
`
