export const listAccountsCommandIamPolicy = (): string => `
Statement:
  - Effect: Allow
    Action:
      - organizations:DescribeOrganization
      - organizations:ListAccounts
    Resource: "*"
`
