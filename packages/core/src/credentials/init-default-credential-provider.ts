import {
  CredentialProviderChain,
  EC2MetadataCredentials,
  ECSCredentials,
  EnvironmentCredentials,
  ProcessCredentials,
  SharedIniFileCredentials,
} from "aws-sdk"
import http from "http"
import { StdTakomoCredentialProvider, TakomoCredentialProvider } from "./model"

const isAwsMetaEndpointAvailable = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      host: "169.254.169.254",
      port: 80,
      path: "/latest/meta-data/",
      timeout: 50,
    }

    const req = http.request(options, (r) => {
      resolve(r.statusCode === 200)
    })

    req.on("timeout", () => {
      req.destroy()
    })

    req.on("error", () => {
      resolve(false)
    })

    req.end()
  })
}

// See: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CredentialProviderChain.html#defaultProviders-property
const initDefaultCredentialProviderChain = async (): Promise<
  CredentialProviderChain
> => {
  const providers = [
    () => new EnvironmentCredentials("AWS"),
    () => new EnvironmentCredentials("AMAZON"),
    // TODO: Should we support MFA too?
    // see: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SharedIniFileCredentials.html
    () => new ECSCredentials(),
    () => new SharedIniFileCredentials(),
    () => new ProcessCredentials(),
  ]

  if (await isAwsMetaEndpointAvailable()) {
    providers.push(() => new EC2MetadataCredentials())
  }

  return new CredentialProviderChain(providers)
}

export const initDefaultCredentialProvider = async (): Promise<
  TakomoCredentialProvider
> =>
  initDefaultCredentialProviderChain()
    .then(
      (credentialProviderChain) =>
        new StdTakomoCredentialProvider({
          name: "default",
          credentialProviderChain,
        }),
    )
    .then((cp) => cp.getCallerIdentity().then(() => cp))
