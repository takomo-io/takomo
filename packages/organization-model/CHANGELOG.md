# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.33.2](https://github.com/takomo-io/takomo/compare/v3.33.1...v3.33.2) (2021-09-15)


### Bug Fixes

* small enhancements ([#301](https://github.com/takomo-io/takomo/issues/301)) ([83efcea](https://github.com/takomo-io/takomo/commit/83efceac961b3d326fddbd4e84dca4b4a5ff924a))





# [3.33.0](https://github.com/takomo-io/takomo/compare/v3.32.0...v3.33.0) (2021-09-12)


### Features

* **organizations:** add new command to list stacks from organization accounts ([#298](https://github.com/takomo-io/takomo/issues/298)) ([1429825](https://github.com/takomo-io/takomo/commit/14298254bcdf41bff53899374803989b24f9a045))





## [3.31.2](https://github.com/takomo-io/takomo/compare/v3.31.1...v3.31.2) (2021-08-24)

**Note:** Version bump only for package @takomo/organization-model





## [3.31.1](https://github.com/takomo-io/takomo/compare/v3.31.0...v3.31.1) (2021-08-23)

**Note:** Version bump only for package @takomo/organization-model





# [3.29.0](https://github.com/takomo-io/takomo/compare/v3.28.0...v3.29.0) (2021-08-16)

**Note:** Version bump only for package @takomo/organization-model





# [3.28.0](https://github.com/takomo-io/takomo/compare/v3.27.0...v3.28.0) (2021-08-15)

**Note:** Version bump only for package @takomo/organization-model





# [3.27.0](https://github.com/takomo-io/takomo/compare/v3.26.0...v3.27.0) (2021-07-22)

**Note:** Version bump only for package @takomo/organization-model





# [3.26.0](https://github.com/takomo-io/takomo/compare/v3.25.0...v3.26.0) (2021-07-21)

**Note:** Version bump only for package @takomo/organization-model





# [3.24.0](https://github.com/takomo-io/takomo/compare/v3.23.0...v3.24.0) (2021-07-07)


### Features

* **organizations:** imporove organization configuration validation ([#263](https://github.com/takomo-io/takomo/issues/263)) ([5009bc2](https://github.com/takomo-io/takomo/commit/5009bc290258b0526bb6dbf7e6648488ae39b5f1))





# [3.21.0](https://github.com/takomo-io/takomo/compare/v3.20.0...v3.21.0) (2021-06-18)

**Note:** Version bump only for package @takomo/organization-model





# [3.18.0](https://github.com/takomo-io/takomo/compare/v3.17.0...v3.18.0) (2021-06-04)

**Note:** Version bump only for package @takomo/organization-model





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
