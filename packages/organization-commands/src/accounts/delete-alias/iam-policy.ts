import dedent from "ts-dedent"

export const deleteAliasCommandIamPolicy = (): string => dedent`
    Statement:
      - Effect: Allow
        Action:
          - iam:DeleteAccountAlias
          - iam:ListAccountAliases
        Resource: "*"
    `
