import {
  CredentialProviderChain,
  Credentials,
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

const initDefaultCredentialProviderChain = async (
  credentials?: Credentials,
): Promise<CredentialProviderChain> => {
  const providers = [
    () => new EnvironmentCredentials("AWS"),
    () => new EnvironmentCredentials("AMAZON"),
    () => new ECSCredentials(),
    () => new SharedIniFileCredentials(),
    () => new ProcessCredentials(),
  ]

  if (await isAwsMetaEndpointAvailable()) {
    providers.push(() => new EC2MetadataCredentials())
  }

  return credentials
    ? new CredentialProviderChain([() => credentials, ...providers])
    : new CredentialProviderChain(providers)
}

export const initDefaultCredentialProvider = async (
  credentials?: Credentials,
): Promise<TakomoCredentialProvider> =>
  initDefaultCredentialProviderChain(credentials)
    .then(
      (credentialProviderChain) =>
        new StdTakomoCredentialProvider({
          name: "default",
          credentialProviderChain,
        }),
    )
    .then((cp) => cp.getCallerIdentity().then(() => cp))
