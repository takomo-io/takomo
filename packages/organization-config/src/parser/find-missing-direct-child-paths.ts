import R from "ramda"

export const findMissingDirectChildrenPaths = (
  childPaths: ReadonlyArray<string>,
  ouPathDepth: number,
): string[] =>
  R.uniq(
    childPaths
      .filter((key) => key.split("/").length >= ouPathDepth + 2)
      .map((key) =>
        key
          .split("/")
          .slice(0, ouPathDepth + 1)
          .join("/"),
      )
      .filter((key) => !childPaths.includes(key)),
  )
