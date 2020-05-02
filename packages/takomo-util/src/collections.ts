interface CollectFromHierarchyProps<T> {
  readonly sortSiblings?: (a: T, b: T) => number
  readonly filter?: (node: T) => boolean
}

export const collectFromHierarchy = <T>(
  root: T,
  extractChildren: (node: T) => T[],
  props?: CollectFromHierarchyProps<T>,
): T[] => {
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
