export const diffSecretsCommandIamPolicy = (): string => `
Statement: 
  - Effect: Allow
    Action:
      - cloudformation:DescribeStacks
      - ssm:GetParametersByPath
      - kms:Decrypt
    Resource: "*" 
`
