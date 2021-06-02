# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.17.0](https://github.com/takomo-io/takomo/compare/v3.16.0...v3.17.0) (2021-06-02)

**Note:** Version bump only for package @takomo/organization-model





# [3.13.0](https://github.com/takomo-io/takomo/compare/v3.12.0...v3.13.0) (2021-05-09)


### Features

* **organizations:** improve organization deploy confirm step ([#230](https://github.com/takomo-io/takomo/issues/230)) ([c2b0056](https://github.com/takomo-io/takomo/commit/c2b0056e353c0e351889c639f2aa35696e02ae30))





# [3.1.0](https://github.com/takomo-io/takomo/compare/v3.0.1...v3.1.0) (2021-02-14)


### Features

* implement loading of accounts from external repository ([#142](https://github.com/takomo-io/takomo/issues/142)) ([953250e](https://github.com/takomo-io/takomo/commit/953250e57b6f0c3349cf94d2636619f9521682c4)), closes [#140](https://github.com/takomo-io/takomo/issues/140)





# [3.0.0](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.5...v3.0.0) (2021-01-23)

**Note:** Version bump only for package @takomo/organization-model





# [3.0.0-alpha.0](https://github.com/takomo-io/takomo/compare/v2.12.1...v3.0.0-alpha.0) (2021-01-10)


### chore

* Prepare release 3.0.0 ([3c0b70b](https://github.com/takomo-io/takomo/commit/3c0b70ba5a6cd5d4472ccdf01e78a2a95465ccc1))


### BREAKING CHANGES

* - Remove secrets management CLI commands
- Remove secret parameter resolver
- Remove secret property from stack configuration files
- Remove projectDir from configSet object used with organization and deployment targets
- All CloudFormation templates are now processed with Handlebars templating engine
- Major refactoring and cleanup of the codebase
