export const createOrganizationCommandIamPolicy = (): string => `
Statement: 
  - Effect: Allow
    Action:
      - iam:CreateServiceLinkedRole
      - organizations:CreateOrganization
    Resource: "*"
`
