import fs, { mkdir, readFile, writeFile } from "fs"
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
    mkdir(pathToDir, (err) => {
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

export interface File {
  readonly basename: FilePath
  readonly fullPath: FilePath
}

export interface Dir {
  readonly basename: FilePath
  readonly fullPath: FilePath
}
