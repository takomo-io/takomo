import dedent from "ts-dedent"

export const createAliasCommandIamPolicy = (): string => dedent`
    Statement:
      - Effect: Allow
        Action:
          - iam:CreateAccountAlias
        Resource: "*"
    `
