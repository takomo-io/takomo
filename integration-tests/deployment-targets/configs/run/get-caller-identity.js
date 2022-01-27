// eslint-disable-next-line @typescript-eslint/no-var-requires
const { STS } = require("@aws-sdk/client-sts")
module.exports = async ({ target, credentials }) => {
  const { Account } = await new STS({ credentials, region: "us-east-1 " })
    .getCallerIdentity({})
    .promise()
  return Account
}
