export const getSecretCommandIamPolicy = (): string => `
Statement: 
  - Effect: Allow
    Action:
      - cloudformation:DescribeStacks
      - ssm:GetParameter
      - kms:Decrypt
    Resource: "*"  
`
