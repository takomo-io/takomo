import { ServicePrincipal } from "@takomo/aws-model"

export const parseTrustedAwsServices = (
  value: any,
): ReadonlyArray<ServicePrincipal> => {
  if (value === null || value === undefined) {
    return []
  }

  return value as ServicePrincipal[]
}
