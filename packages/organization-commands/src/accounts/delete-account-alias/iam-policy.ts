import dedent from "ts-dedent"

export const deleteAccountAliasCommandIamPolicy = (): string => dedent`

    # This command must be run using credentials of the organization 
    # master account with the following permissions.
    Statement:
      - Effect: Allow
        Action: sts:AssumeRole
        Resource: "*" 
        
    # The role in the target account must have the following permissions. 
    Statement:
      - Effect: Allow
        Action:
          - iam:DeleteAccountAlias
          - iam:ListAccountAliases
        Resource: "*"          
    `
