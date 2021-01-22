# Takomo

Documentation for Takomo public API.

Interfaces, types, functions and classes documented here are stable. Possible backward-incompatible changes to them are introduced only along with new major version releases.

Most of the modules are undocumented and subject to breaking changes.

## Quick links

Here are some links to the most important types:

- [Stack](interfaces/stacks_model_src.stack.html) - Represents a CloudFormation stack
- [Resolver](interfaces/stacks_model_src.resolver.html) - Used to resolve parameter values at deployment time
- [ResolverProvider](interfaces/stacks_model_src.resolverprovider.html) - Used to initialize ResolverProvider objects
- [Hook](interfaces/stacks_model_src.hook.html) - Used to execute actions during stack operations
- [HookInitializer](modules/stacks_model_src.html#hookinitializer) - Used to initialize Hook objects
- [CommandContext](interfaces/core_src.commandcontext.html) - Provides access to the current project configuration
- [StackContext](interfaces/stacks_model_src.stackscontext.html) - Provides access to the current stacks and project configuration
