export const listSecretsCommandIamPolicy = (): string => `
Statement: 
  - Effect: Allow
    Action:
      - kms:Decrypt
      - ssm:GetParameter
      - cloudformation:DescribeStacks
    Resource: "*" 
`
