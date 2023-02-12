import { resolvePolicyOperation } from "../../../../src/cli-io/stacks/deploy-stacks/stack-policy"

const policy1 = `
 {
    "Statement": [
      {
        "Effect": "Deny",
        "Action": ["Update:Replace", "Update:Delete"],
        "Principal": "*",
        "Resource": "*",
        "Condition": {
          "StringEquals": {
            "ResourceType": [
              "AWS::Cognito::UserPool",
              "AWS::Cognito::UserPoolClient"
            ]
          }
        }
      },
      {
        "Effect": "Allow",
        "Action": "Update:*",
        "Principal": "*",
        "Resource": "*"
      }
    ]
  }
`

const policy2 = `
 {
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "Update:*",
        "Principal": "*",
        "Resource": "*"
      }
    ]
  }
`

const policy3 = `
 {
    "Statement": [
      {
        "Action": "Update:*",
        "Effect": "Allow",
        "Resource": "*",
        "Principal": "*"
      }
    ]
  }
`

describe("#resolvePolicyOperation", () => {
  test("current and updated are undefined", () => {
    expect(resolvePolicyOperation(undefined, undefined)).toBe("retain")
  })

  test("current and updated are different", () => {
    expect(resolvePolicyOperation(policy1, policy2)).toBe("update")
  })

  test("current is defined and updated is undefined", () => {
    expect(resolvePolicyOperation(policy1, undefined)).toBe("delete")
  })

  test("current is undefined and updated is defined", () => {
    expect(resolvePolicyOperation(undefined, policy2)).toBe("create")
  })

  test("current and updated are same but have different order of properties", () => {
    expect(resolvePolicyOperation(policy2, policy3)).toBe("retain")
  })
})
