import fs, { mkdir, readFile, rm, writeFile } from "fs"
import { join } from "path"
import { promisify } from "util"

const statP = promisify(fs.stat)
const readFileP = promisify(readFile)

export type FilePath = string

export const readFileContents = async (pathToFile: FilePath): Promise<string> =>
  readFileP(pathToFile, { encoding: "utf8" }).then((contents) =>
    contents.toString(),
  )

export const fileExists = async (pathToFile: FilePath): Promise<boolean> =>
  statP(pathToFile)
    .then((s) => s.isFile())
    .catch(() => false)

export const dirExists = async (pathToDir: FilePath): Promise<boolean> =>
  statP(pathToDir)
    .then((s) => s.isDirectory())
    .catch(() => false)

export const createDir = async (pathToDir: FilePath): Promise<boolean> =>
  new Promise((resolve, reject) => {
    mkdir(pathToDir, { recursive: true }, (err) => {
      if (err) reject(err)
      else resolve(true)
    })
  })

export const removeDir = async (pathToDir: FilePath): Promise<boolean> =>
  new Promise((resolve, reject) => {
    rm(pathToDir, { recursive: true }, (err) => {
      if (err) reject(err)
      else resolve(true)
    })
  })

export const createFile = async (
  pathToFile: FilePath,
  content: string,
): Promise<boolean> =>
  new Promise((resolve, reject) => {
    writeFile(pathToFile, content, (err) => {
      if (err) reject(err)
      else resolve(true)
    })
  })

export const expandFilePath = (
  baseDir: FilePath,
  filePath: FilePath,
): FilePath => {
  if (filePath.startsWith("/") || filePath.startsWith("~")) {
    return filePath
  }

  if (filePath.startsWith("./")) {
    return join(baseDir, filePath.slice(2))
  }

  return join(baseDir, filePath)
}
