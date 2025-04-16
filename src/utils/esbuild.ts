import { build } from "esbuild"
import { FilePath } from "./files.js"

export interface CompileTypescriptProps {
  readonly outfile: FilePath
  readonly entryPoints: ReadonlyArray<FilePath>
  readonly banner?: { [type: string]: string }
}

export const compileTypescript = async ({
  entryPoints,
  outfile,
}: CompileTypescriptProps): Promise<void> => {
  await build({
    write: true,
    bundle: true,
    sourcemap: true,
    packages: "external",
    platform: "node",
    logLevel: "error",
    target: "node22.14.0",
    format: "esm",
    outfile,
    entryPoints: entryPoints.slice(),
    // Fix for https://github.com/evanw/esbuild/pull/2067
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
  })
}
