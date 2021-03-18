export interface Vars {
  [key: string]: any
}

export interface EnvVars {
  [key: string]: string
}

export interface ContextVars {
  readonly projectDir: string
}

export interface Variables {
  readonly env: EnvVars
  readonly var: Vars
  readonly context: ContextVars
  readonly [key: string]: unknown
}
