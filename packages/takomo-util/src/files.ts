import fs, { mkdir, readFile, writeFile } from "fs"
import { promisify } from "util"

const statP = promisify(fs.stat)
const readFileP = promisify(readFile)

export const readFileContents = async (pathToFile: string): Promise<string> =>
  readFileP(pathToFile, { encoding: "UTF-8" }).then((contents) =>
    contents.toString(),
  )

export const fileExists = async (pathToFile: string): Promise<boolean> =>
  statP(pathToFile)
    .then((s) => s.isFile())
    .catch(() => false)

export const dirExists = async (pathToDir: string): Promise<boolean> =>
  statP(pathToDir)
    .then((s) => s.isDirectory())
    .catch(() => false)

export const createDir = async (pathToDir: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    mkdir(pathToDir, (err) => {
      if (err) reject(err)
      else resolve(true)
    })
  })

export const createFile = async (
  pathToFile: string,
  content: string,
): Promise<boolean> =>
  new Promise((resolve, reject) => {
    writeFile(pathToFile, content, (err) => {
      if (err) reject(err)
      else resolve(true)
    })
  })
