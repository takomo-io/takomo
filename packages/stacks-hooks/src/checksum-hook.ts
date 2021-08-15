import { Hook, HookInput, HookOutput } from "@takomo/stacks-model"
import { expandFilePath, FilePath } from "@takomo/util"
import { hashElement } from "folder-hash"

/**
 * @hidden
 */
export class ChecksumHook implements Hook {
  readonly algo = "sha1"
  readonly dir: FilePath
  readonly encoding: "base64" | "hex"

  constructor(config: any) {
    if (!config.dir) {
      throw new Error("dir is required property")
    }
    this.dir = config.dir

    this.encoding = config.encoding ?? "base64"
    if (!["base64", "hex"].includes(this.encoding)) {
      throw new Error("encoding must be one of: base64, hex")
    }
  }

  async execute(input: HookInput): Promise<HookOutput> {
    const name = expandFilePath(input.ctx.projectDir, this.dir)

    const { hash } = await hashElement(name, {
      algo: this.algo,
      encoding: this.encoding,
    })

    return {
      success: true,
      value: hash,
    }
  }
}
