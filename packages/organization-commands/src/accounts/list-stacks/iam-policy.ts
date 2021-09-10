export const listAccountsStacksCommandIamPolicy = (): string => `
Statement:
  - Effect: Allow
    Action:
      - organizations:DescribeOrganization
      - organizations:ListAccounts
    Resource: "*"
`
