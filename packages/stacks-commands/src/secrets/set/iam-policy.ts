export const setSecretCommandIamPolicy = (): string => `
Statement: 
  - Effect: Allow
    Action:
      - cloudformation:DescribeStacks
      - kms:Encrypt
      - ssm:PutParameter
    Resource: "*"
`
