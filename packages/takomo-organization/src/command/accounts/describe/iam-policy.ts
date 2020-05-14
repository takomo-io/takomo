export const describeAccountCommandIamPolicy = (): string => `
Statement:
  - Effect: Allow
    Action:
      - organizations:DescribeOrganization
      - organizations:ListAccounts
    Resource: "*"
`
