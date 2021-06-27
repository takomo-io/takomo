// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require("aws-sdk")
module.exports = async ({ target, credentials }) => {
  const { Account } = await new AWS.STS({ credentials, region: "us-east-1 " })
    .getCallerIdentity({})
    .promise()
  return Account
}
