import fs, { mkdir, readFile, writeFile } from "fs"
import { join } from "path"
import { promisify } from "util"

const statP = promisify(fs.stat)
const readFileP = promisify(readFile)

/**
 * @hidden
 */
export type FilePath = string

/**
 * @hidden
 */
export const readFileContents = async (pathToFile: FilePath): Promise<string> =>
  readFileP(pathToFile, { encoding: "utf8" }).then((contents) =>
    contents.toString(),
  )

/**
 * @hidden
 */
export const fileExists = async (pathToFile: FilePath): Promise<boolean> =>
  statP(pathToFile)
    .then((s) => s.isFile())
    .catch(() => false)

/**
 * @hidden
 */
export const dirExists = async (pathToDir: FilePath): Promise<boolean> =>
  statP(pathToDir)
    .then((s) => s.isDirectory())
    .catch(() => false)

/**
 * @hidden
 */
export const createDir = async (pathToDir: FilePath): Promise<boolean> =>
  new Promise((resolve, reject) => {
    mkdir(pathToDir, (err) => {
      if (err) reject(err)
      else resolve(true)
    })
  })

/**
 * @hidden
 */
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

/**
 * @hidden
 */
export const expandFilePath = (
  projectDir: FilePath,
  filePath: FilePath,
): FilePath => {
  if (filePath.startsWith("/") || filePath.startsWith("~")) {
    return filePath
  }

  if (filePath.startsWith("./")) {
    return join(projectDir, filePath.substr(2))
  }

  return join(projectDir, filePath)
}
