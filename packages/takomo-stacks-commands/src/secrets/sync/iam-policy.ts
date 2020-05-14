export const syncSecretsCommandIamPolicy = (): string => `
Statement: 
  - Effect: Allow
    Action:
      - ssm:PutParameter
      - kms:Decrypt
      - kms:Encrypt
      - ssm:GetParameterHistory
      - ssm:GetParametersByPath
      - cloudformation:DescribeStacks
    Resource: "*"
`
