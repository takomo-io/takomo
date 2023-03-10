// eslint-disable-next-line @typescript-eslint/no-var-requires
import { STS } from "@aws-sdk/client-sts"
export default async ({ credentials }) => {
  const { Account } = await new STS({
    credentials,
    region: "us-east-1",
  }).getCallerIdentity({})

  return Account
}
