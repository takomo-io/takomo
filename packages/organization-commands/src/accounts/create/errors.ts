import { OrganizationalUnitPath } from "@takomo/organization-model"
import { TakomoError } from "@takomo/util"

export class UnknownOrganizationalUnitError extends TakomoError {
  constructor(ou: OrganizationalUnitPath) {
    super(
      `Provided organizational unit path '${ou}' is not found from the local configuration`,
      {
        info:
          "New account can be added only to an existing organizational unit.",
        instructions: [
          "Give organizational unit path that exist in the local configuration",
        ],
      },
    )
  }
}
