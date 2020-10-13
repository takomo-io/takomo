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

const sortStacks = (
  stacks: Stack[],
  selector: (stack: Stack) => StackPath[],
): Stack[] => {
  const unsorted = new Map(stacks.map((s) => [s.getPath(), s]))
  const sorted = new Array<Stack>()
  while (unsorted.size > 0) {
    Array.from(unsorted.values())
      .filter((s) => selector(s).filter((d) => unsorted.has(d)).length === 0)
      .sort((a, b) => a.getPath().localeCompare(b.getPath()))
      .forEach((s) => {
        sorted.push(s)
        unsorted.delete(s.getPath())
      })
  }

  return sorted
}

export const sortStacksForUndeploy = (stacks: Stack[]): Stack[] =>
  sortStacks(stacks, (s) => s.getDependants())

export const sortStacksForDeploy = (stacks: Stack[]): Stack[] =>
  sortStacks(stacks, (s) => s.getDependencies())
