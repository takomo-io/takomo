import { StackPath } from "@takomo/core"
import { TakomoError } from "@takomo/util"
import flatten from "lodash.flatten"
import uniq from "lodash.uniq"
import { Stack, StackProps } from "../model"

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
