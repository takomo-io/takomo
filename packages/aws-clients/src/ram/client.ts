import { RAM } from "aws-sdk"
import { AwsClientProps, createClient } from "../common/client"

/**
 * @hidden
 */
export interface RamClient {
  readonly enableSharingWithAwsOrganization: () => Promise<boolean>
}

/**
 * @hidden
 */
export const createRamClient = (props: AwsClientProps): RamClient => {
  const { withClientPromise } = createClient({
    ...props,
    clientConstructor: (configuration) => new RAM(configuration),
  })

  const enableSharingWithAwsOrganization = (): Promise<boolean> =>
    withClientPromise(
      (c) => c.enableSharingWithAwsOrganization(),
      () => true,
    )

  return { enableSharingWithAwsOrganization }
}
