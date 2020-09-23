import { StackPath } from "@takomo/core"
import { Stack, StackProps } from "@takomo/stacks-model"
import { TakomoError } from "@takomo/util"
import flatten from "lodash.flatten"
import uniq from "lodash.uniq"

export const checkCyclicDependenciesForStack = (
  stack: Stack,
  stacks: Map<StackPath, Stack>,
  collectedDependencies: StackPath[],
) => {
  if (stack.getDependencies().length === 0) {
    return
  }

  stack.getDependencies().forEach((d) => {
    if (collectedDependencies.includes(d)) {
      throw new TakomoError(
        `Cyclic dependency detected: ${collectedDependencies.join(
          " -> ",
        )} -> ${d}`,
      )
    }

    checkCyclicDependenciesForStack(stacks.get(d)!, stacks, [
      ...collectedDependencies,
      d,
    ])
  })
}

export const checkCyclicDependencies = (stacks: Map<StackPath, Stack>) => {
  stacks.forEach((s) =>
    checkCyclicDependenciesForStack(s, stacks, [s.getPath()]),
  )
}

export const collectAllDependencies = (
  stackPath: StackPath,
  stacks: Stack[],
): StackPath[] => {
  const stack = stacks.find((s) => s.getPath() === stackPath)!
  return uniq(
    stack.getDependencies().reduce((collected, dependencyPath) => {
      const childDependencies = collectAllDependencies(dependencyPath, stacks)
      return [...collected, ...childDependencies, dependencyPath]
    }, new Array<StackPath>()),
  )
}

export const collectAllDependants = (
  stackPath: StackPath,
  stacks: Stack[],
): StackPath[] => {
  const stack = stacks.find((s) => s.getPath() === stackPath)!
  return uniq(
    stack.getDependants().reduce((collected, dependantPath) => {
      const childDependants = collectAllDependants(dependantPath, stacks)
      return [...collected, ...childDependants, dependantPath]
    }, new Array<StackPath>()),
  )
}

export const collectStackDirectDependants = (
  stackPath: StackPath,
  stacks: StackProps[],
): string[] =>
  stacks
    .filter((s) => s.path !== stackPath)
    .reduce((dependants, s) => {
      return s.dependencies.includes(stackPath)
        ? [...dependants, s.path]
        : dependants
    }, new Array<string>())

export const populateDependants = (stacks: StackProps[]): StackProps[] =>
  stacks.reduce((collected, stack) => {
    const dependants = collectStackDirectDependants(stack.path, stacks)
    return [...collected, { ...stack, dependants }]
  }, new Array<StackProps>())

export const processStackDependencies = (stacks: Stack[]): Stack[] => {
  const processed = stacks
    .map((stack) => stack.toProps())
    .map((stack) => {
      const stackDependencies = stack.dependencies.map((dependency) => {
        const matching = stacks
          .filter((other) => other.getPath().startsWith(dependency))
          .map((other) => other.getPath())

        if (matching.length === 0) {
          throw new TakomoError(
            `Dependency ${dependency} in stack ${stack.path} refers to a non-existing stack`,
          )
        }

        return matching
      })

      const parameterDependencies = Array.from(
        stack.parameters.entries(),
      ).reduce((collected, [parameterName, resolver]) => {
        const matchingParamDeps = resolver
          .getDependencies()
          .map((dependency) => {
            const matching = stacks
              .filter((other) => other.getPath().startsWith(dependency))
              .map((other) => other.getPath())

            if (matching.length === 0) {
              throw new TakomoError(
                `Dependency ${dependency} in parameter ${parameterName} of stack ${stack.path} refers to a non-existing stack`,
              )
            }

            return matching
          })

        return [...collected, ...flatten(matchingParamDeps)]
      }, new Array<StackPath>())

      return {
        ...stack,
        dependencies: uniq(
          flatten([...stackDependencies, ...parameterDependencies]),
        ),
      }
    })

  return populateDependants(processed).map((props) => new Stack(props))
}

interface SortItem {
  readonly stack: Stack
  readonly stackPath: StackPath
  readonly deps: string[]
}

const compare = (a: SortItem, b: SortItem): number => {
  if (a.deps.length + b.deps.length === 0) {
    return a.stackPath.localeCompare(b.stackPath)
  }
  if (a.deps.length === 0) {
    return -1
  }
  if (b.deps.length === 0) {
    return 1
  }
  if (a.deps.includes(b.stackPath)) {
    return 1
  }
  if (b.deps.includes(a.stackPath)) {
    return -1
  }

  return a.stackPath.localeCompare(b.stackPath)
}

const sortStacks = (
  stacks: Stack[],
  depsCollector: (stackPath: StackPath, stacks: Stack[]) => StackPath[],
): Stack[] => {
  const items = stacks.map((stack) => ({
    stack,
    stackPath: stack.getPath(),
    deps: depsCollector(stack.getPath(), stacks),
  }))

  const sorted = new Array<SortItem>()

  while (items.length > 0) {
    let candidateIndex = 0
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const candidate = items[candidateIndex]
      const result = compare(item, candidate)
      if (result === -1) {
        candidateIndex = i
      }
    }

    sorted.push(items[candidateIndex])
    items.splice(candidateIndex, 1)
  }

  return sorted.map(({ stack }) => stack)
}

export const sortStacksForUndeploy = (stacks: Stack[]): Stack[] =>
  sortStacks(stacks, collectAllDependants)

export const sortStacksForDeploy = (stacks: Stack[]): Stack[] =>
  sortStacks(stacks, collectAllDependencies)
