export const detectDriftCommandIamPolicy = (): string => `
Statement: 
  - Sid: Stacks
    Effect: Allow
    Action:
      - cloudformation:DescribeStacks
      - cloudformation:DetectStackDrift
      - cloudformation:DescribeStackDriftDetectionStatus
    Resource: "*"

  # IAM permissions needed only if command roles are used  
  # Specify resource to restrict access to specific roles.  
  - Sid: IAM
    Effect: Allow
    Action:
      - sts:AssumeRole
    Resource: "*"   
`
