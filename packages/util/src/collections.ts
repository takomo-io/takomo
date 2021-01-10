interface CollectFromHierarchyProps<T> {
  readonly sortSiblings?: (a: T, b: T) => number
  readonly filter?: (node: T) => boolean
}

/**
 * @hidden
 */
export const collectFromHierarchy = <T>(
  root: T,
  extractChildren: (node: T) => ReadonlyArray<T>,
  props?: CollectFromHierarchyProps<T>,
): ReadonlyArray<T> => {
  const filter = props?.filter || (() => true)
  if (!filter(root)) {
    return []
  }

  const children = extractChildren(root).filter(filter)
  const sortedChildren = props?.sortSiblings
    ? children.slice().sort(props?.sortSiblings)
    : children

  return sortedChildren.reduce(
    (collected, child) => {
      const values = collectFromHierarchy(child, extractChildren, props)
      return [...collected, ...values]
    },
    [root],
  )
}

/**
 * @hidden
 */
export const mapToObject = (map: Map<string, any>): any =>
  Array.from(map.entries()).reduce(
    (collected, [key, value]) => ({ ...collected, [key]: value }),
    {},
  )

/**
 * @hidden
 */
export const arrayToMap = <T>(
  items: ReadonlyArray<T>,
  keyExtractor: (item: T) => string,
): Map<string, T> => new Map(items.map((item) => [keyExtractor(item), item]))
