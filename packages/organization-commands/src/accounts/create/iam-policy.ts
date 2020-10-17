import dedent from "ts-dedent"

export const createAccountCommandIamPolicy = (): string => dedent`

    # This command must be run using credentials of the organization 
    # master account with the following permissions.
    Statement:
      - Effect: Allow
        Action:
          - organizations:DescribeOrganization
          - organizations:CreateAccount
          - organizations:DescribeCreateAccountStatus
        Resource: "*"

`
