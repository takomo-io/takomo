import { ListOrganizationalUnitsForParentCommandOutput } from "@aws-sdk/client-organizations"
import {
  collectOrganizationalUnitsForParent,
  OrganizationalUnitsPageProvider,
} from "../../../src/aws/organizations/client.js"
import { OU } from "../../../src/aws/organizations/model.js"

const root: OU = {
  id: "r-root",
  arn: "arn:root",
  name: "Root",
  path: "ROOT",
}

const page = (
  organizationalUnits: ReadonlyArray<{
    readonly Id: string
    readonly Arn: string
    readonly Name: string
  }>,
  nextToken?: string,
): ListOrganizationalUnitsForParentCommandOutput => ({
  $metadata: {},
  OrganizationalUnits: organizationalUnits,
  NextToken: nextToken,
})

describe("#collectOrganizationalUnitsForParent", () => {
  test("collects every page at every level of the OU hierarchy", async () => {
    const requestedParents = new Array<string>()
    const pagesByParent: Record<
      string,
      ReadonlyArray<ListOrganizationalUnitsForParentCommandOutput>
    > = {
      "r-root": [
        page(
          [
            {
              Id: "ou-engineering",
              Arn: "arn:engineering",
              Name: "Engineering",
            },
          ],
          "root-next",
        ),
        page([{ Id: "ou-finance", Arn: "arn:finance", Name: "Finance" }]),
      ],
      "ou-engineering": [
        page([], "engineering-next"),
        page([{ Id: "ou-security", Arn: "arn:security", Name: "Security" }]),
      ],
      "ou-finance": [page([])],
      "ou-security": [page([])],
    }
    const pageProvider: OrganizationalUnitsPageProvider = async function* (
      parentId,
    ) {
      requestedParents.push(parentId)
      yield* pagesByParent[parentId] ?? []
    }

    const ous = await collectOrganizationalUnitsForParent(root, pageProvider)

    expect(ous).toStrictEqual([
      {
        id: "ou-engineering",
        arn: "arn:engineering",
        name: "Engineering",
        path: "ROOT/Engineering",
      },
      {
        id: "ou-finance",
        arn: "arn:finance",
        name: "Finance",
        path: "ROOT/Finance",
      },
      {
        id: "ou-security",
        arn: "arn:security",
        name: "Security",
        path: "ROOT/Engineering/Security",
      },
    ])
    expect(requestedParents).toStrictEqual([
      "r-root",
      "ou-engineering",
      "ou-security",
      "ou-finance",
    ])
  })
})
