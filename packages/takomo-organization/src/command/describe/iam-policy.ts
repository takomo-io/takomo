export const describeOrganizationCommandIamPolicy = (): string => `
Statement:
  - Effect: Allow
    Action:
      - organizations:ListRoots
      - organizations:DescribeOrganization
      - organizations:DescribeAccount
      - organizations:ListAWSServiceAccessForOrganization
    Resource: "*"
`
