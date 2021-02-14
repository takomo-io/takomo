# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.1.0](https://github.com/takomo-io/takomo/compare/v3.0.1...v3.1.0) (2021-02-14)


### Features

* implement loading of accounts from external repository ([#142](https://github.com/takomo-io/takomo/issues/142)) ([953250e](https://github.com/takomo-io/takomo/commit/953250e57b6f0c3349cf94d2636619f9521682c4)), closes [#140](https://github.com/takomo-io/takomo/issues/140)
* persist created accounts using account repository ([#146](https://github.com/takomo-io/takomo/issues/146)) ([69a0231](https://github.com/takomo-io/takomo/commit/69a02312d6ed4da64a7cf6d45d4f62b883afa791)), closes [#141](https://github.com/takomo-io/takomo/issues/141)





## [3.0.1](https://github.com/takomo-io/takomo/compare/v3.0.0...v3.0.1) (2021-01-31)

**Note:** Version bump only for package @takomo/core





# [3.0.0](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.5...v3.0.0) (2021-01-23)

**Note:** Version bump only for package @takomo/core





# [3.0.0-alpha.5](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2021-01-20)

**Note:** Version bump only for package @takomo/core





# [3.0.0-alpha.4](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2021-01-18)

**Note:** Version bump only for package @takomo/core





# [3.0.0-alpha.2](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2021-01-17)

**Note:** Version bump only for package @takomo/core





# [3.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2021-01-15)

**Note:** Version bump only for package @takomo/core





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





## [2.12.1](https://github.com/takomo-io/takomo/compare/v2.12.0...v2.12.1) (2020-12-25)

**Note:** Version bump only for package @takomo/core





# [2.11.0](https://github.com/takomo-io/takomo/compare/v2.10.1...v2.11.0) (2020-10-17)

**Note:** Version bump only for package @takomo/core





# [2.10.0](https://github.com/takomo-io/takomo/compare/v2.9.0...v2.10.0) (2020-10-11)


### Bug Fixes

* fix reviewing of stacks whose template uses 'AWS::Serverless-2016-10-31' transformation ([#113](https://github.com/takomo-io/takomo/issues/113)) ([5f1df87](https://github.com/takomo-io/takomo/commit/5f1df87fe8a65df8345bac2eb8cfdc8d90266043)), closes [#112](https://github.com/takomo-io/takomo/issues/112)





# [2.9.0](https://github.com/takomo-io/takomo/compare/v2.8.0...v2.9.0) (2020-10-09)

**Note:** Version bump only for package @takomo/core





# [2.8.0](https://github.com/takomo-io/takomo/compare/v2.7.4...v2.8.0) (2020-10-05)

**Note:** Version bump only for package @takomo/core





## [2.7.4](https://github.com/takomo-io/takomo/compare/v2.7.3...v2.7.4) (2020-09-27)

**Note:** Version bump only for package @takomo/core





## [2.7.1](https://github.com/takomo-io/takomo/compare/v2.7.0...v2.7.1) (2020-09-02)

**Note:** Version bump only for package @takomo/core





# [2.7.0](https://github.com/takomo-io/takomo/compare/v2.6.2...v2.7.0) (2020-08-31)

**Note:** Version bump only for package @takomo/core





## [2.6.1](https://github.com/takomo-io/takomo/compare/v2.6.0...v2.6.1) (2020-08-20)

**Note:** Version bump only for package @takomo/core





# [2.5.0](https://github.com/takomo-io/takomo/compare/v2.4.0...v2.5.0) (2020-07-28)


### Features

* add support for AWS backup trusted service for organization management ([#73](https://github.com/takomo-io/takomo/issues/73)) ([7a522eb](https://github.com/takomo-io/takomo/commit/7a522eb5baf6c2ef039fd9211323b1130591372e)), closes [#70](https://github.com/takomo-io/takomo/issues/70)
* improve organization deployment ([#72](https://github.com/takomo-io/takomo/issues/72)) ([6104896](https://github.com/takomo-io/takomo/commit/6104896c1b90654ddb0e63de2703a7327d997c85)), closes [#71](https://github.com/takomo-io/takomo/issues/71)





# [2.4.0](https://github.com/takomo-io/takomo/compare/v2.3.0...v2.4.0) (2020-07-07)


### Features

* update prompts used to ask input from user ([#62](https://github.com/takomo-io/takomo/issues/62)) ([ff98787](https://github.com/takomo-io/takomo/commit/ff98787f3184246511a55496975321ff33d9598a)), closes [#31](https://github.com/takomo-io/takomo/issues/31)





# [2.3.0](https://github.com/takomo-io/takomo/compare/v2.2.1...v2.3.0) (2020-07-02)


### Features

* improve error handling when parsing yaml files ([#60](https://github.com/takomo-io/takomo/issues/60)) ([2a35bda](https://github.com/takomo-io/takomo/commit/2a35bda327e3ff18aa62712eb5144431f7b9e7c7)), closes [#57](https://github.com/takomo-io/takomo/issues/57)





# [2.1.0](https://github.com/takomo-io/takomo/compare/v2.0.0...v2.1.0) (2020-06-21)


### Features

* add projectDir property to config sets ([#51](https://github.com/takomo-io/takomo/issues/51)) ([263bd17](https://github.com/takomo-io/takomo/commit/263bd175ae7748793953712da28a5d0bac7e25f0)), closes [#24](https://github.com/takomo-io/takomo/issues/24)





# [2.0.0](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.1...v2.0.0) (2020-06-15)

**Note:** Version bump only for package @takomo/core





# [2.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2020-06-15)

**Note:** Version bump only for package @takomo/core





# [2.0.0-alpha.0](https://github.com/takomo-io/takomo/compare/v1.3.1...v2.0.0-alpha.0) (2020-06-15)


### Features

* require nodejs version 14.4.0 ([#50](https://github.com/takomo-io/takomo/issues/50)) ([da186b4](https://github.com/takomo-io/takomo/commit/da186b44aadee05fb1478f21a536d0c7b6343553)), closes [#46](https://github.com/takomo-io/takomo/issues/46)


### BREAKING CHANGES

* Takomo now requires nodejs version 14.4.0





# [1.3.0](https://github.com/takomo-io/takomo/compare/v1.2.1...v1.3.0) (2020-06-09)

**Note:** Version bump only for package @takomo/core





## [1.2.1](https://github.com/takomo-io/takomo/compare/v1.2.0...v1.2.1) (2020-05-29)

**Note:** Version bump only for package @takomo/core





# [1.2.0](https://github.com/takomo-io/takomo/compare/v1.1.0...v1.2.0) (2020-05-28)

**Note:** Version bump only for package @takomo/core





# [1.1.0](https://github.com/takomo-io/takomo/compare/v1.0.0...v1.1.0) (2020-05-18)

**Note:** Version bump only for package @takomo/core





# [1.0.0](https://github.com/takomo-io/takomo/compare/v0.2.0...v1.0.0) (2020-05-12)

**Note:** Version bump only for package @takomo/core





# [0.2.0](https://github.com/takomo-io/takomo/compare/v0.1.0...v0.2.0) (2020-05-07)


### Features

* add new trusted aws services ([#6](https://github.com/takomo-io/takomo/issues/6)) ([5c224d3](https://github.com/takomo-io/takomo/commit/5c224d3e92b6d0ea1c426a3ba87af44f2aa80652)), closes [#5](https://github.com/takomo-io/takomo/issues/5)





# [0.1.0](https://github.com/takomo-io/takomo/compare/v0.0.2...v0.1.0) (2020-05-06)


### Bug Fixes

* fix loading of required version from Takomo project configuration file ([ff94c01](https://github.com/takomo-io/takomo/commit/ff94c0137aea4ecc05d6a0ccdbb1701865daef4f)), closes [#3](https://github.com/takomo-io/takomo/issues/3)


### Features

* add support for new regions: Milan and Capetown ([#2](https://github.com/takomo-io/takomo/issues/2)) ([5209694](https://github.com/takomo-io/takomo/commit/5209694196117e8c7e0e660491ef9d8a1dad3d46)), closes [#1](https://github.com/takomo-io/takomo/issues/1)





## 0.0.2 (2020-05-04)

**Note:** Version bump only for package @takomo/core
