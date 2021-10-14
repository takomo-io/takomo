# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.37.0](https://github.com/takomo-io/takomo/compare/v3.36.0...v3.37.0) (2021-10-14)

**Note:** Version bump only for package @takomo/aws-schema





## [3.35.1](https://github.com/takomo-io/takomo/compare/v3.35.0...v3.35.1) (2021-09-26)

**Note:** Version bump only for package @takomo/aws-schema





## [3.33.2](https://github.com/takomo-io/takomo/compare/v3.33.1...v3.33.2) (2021-09-15)


### Bug Fixes

* small enhancements ([#301](https://github.com/takomo-io/takomo/issues/301)) ([83efcea](https://github.com/takomo-io/takomo/commit/83efceac961b3d326fddbd4e84dca4b4a5ff924a))





# [3.33.0](https://github.com/takomo-io/takomo/compare/v3.32.0...v3.33.0) (2021-09-12)

**Note:** Version bump only for package @takomo/aws-schema





## [3.31.2](https://github.com/takomo-io/takomo/compare/v3.31.1...v3.31.2) (2021-08-24)

**Note:** Version bump only for package @takomo/aws-schema





## [3.31.1](https://github.com/takomo-io/takomo/compare/v3.31.0...v3.31.1) (2021-08-23)

**Note:** Version bump only for package @takomo/aws-schema





# [3.29.0](https://github.com/takomo-io/takomo/compare/v3.28.0...v3.29.0) (2021-08-16)

**Note:** Version bump only for package @takomo/aws-schema





# [3.28.0](https://github.com/takomo-io/takomo/compare/v3.27.0...v3.28.0) (2021-08-15)

**Note:** Version bump only for package @takomo/aws-schema





# [3.27.0](https://github.com/takomo-io/takomo/compare/v3.26.0...v3.27.0) (2021-07-22)

**Note:** Version bump only for package @takomo/aws-schema





# [3.26.0](https://github.com/takomo-io/takomo/compare/v3.25.0...v3.26.0) (2021-07-21)

**Note:** Version bump only for package @takomo/aws-schema





# [3.24.0](https://github.com/takomo-io/takomo/compare/v3.23.0...v3.24.0) (2021-07-07)

**Note:** Version bump only for package @takomo/aws-schema





# [3.21.0](https://github.com/takomo-io/takomo/compare/v3.20.0...v3.21.0) (2021-06-18)

**Note:** Version bump only for package @takomo/aws-schema





# [3.18.0](https://github.com/takomo-io/takomo/compare/v3.17.0...v3.18.0) (2021-06-04)

**Note:** Version bump only for package @takomo/aws-schema





# [3.17.0](https://github.com/takomo-io/takomo/compare/v3.16.0...v3.17.0) (2021-06-02)

**Note:** Version bump only for package @takomo/aws-schema





# [3.13.0](https://github.com/takomo-io/takomo/compare/v3.12.0...v3.13.0) (2021-05-09)

**Note:** Version bump only for package @takomo/aws-schema





# [3.12.0](https://github.com/takomo-io/takomo/compare/v3.11.1...v3.12.0) (2021-04-27)

**Note:** Version bump only for package @takomo/aws-schema





# [3.9.0](https://github.com/takomo-io/takomo/compare/v3.8.0...v3.9.0) (2021-04-12)

**Note:** Version bump only for package @takomo/aws-schema





# [3.8.0](https://github.com/takomo-io/takomo/compare/v3.7.0...v3.8.0) (2021-04-08)

**Note:** Version bump only for package @takomo/aws-schema





# [3.6.0](https://github.com/takomo-io/takomo/compare/v3.5.1...v3.6.0) (2021-03-28)

**Note:** Version bump only for package @takomo/aws-schema





# [3.4.0](https://github.com/takomo-io/takomo/compare/v3.3.0...v3.4.0) (2021-03-08)

**Note:** Version bump only for package @takomo/aws-schema





# [3.3.0](https://github.com/takomo-io/takomo/compare/v3.2.2...v3.3.0) (2021-02-22)

**Note:** Version bump only for package @takomo/aws-schema





# [3.1.0](https://github.com/takomo-io/takomo/compare/v3.0.1...v3.1.0) (2021-02-14)


### Features

* implement loading of accounts from external repository ([#142](https://github.com/takomo-io/takomo/issues/142)) ([953250e](https://github.com/takomo-io/takomo/commit/953250e57b6f0c3349cf94d2636619f9521682c4)), closes [#140](https://github.com/takomo-io/takomo/issues/140)





## [3.0.1](https://github.com/takomo-io/takomo/compare/v3.0.0...v3.0.1) (2021-01-31)

**Note:** Version bump only for package @takomo/aws-schema





# [3.0.0](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.5...v3.0.0) (2021-01-23)

**Note:** Version bump only for package @takomo/aws-schema





# [3.0.0-alpha.5](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2021-01-20)

**Note:** Version bump only for package @takomo/aws-schema





# [3.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2021-01-15)

**Note:** Version bump only for package @takomo/aws-schema





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





## [2.11.1](https://github.com/takomo-io/takomo/compare/v2.11.0...v2.11.1) (2020-10-20)


### Bug Fixes

* add NetworkingError to the list of retryable errors ([#124](https://github.com/takomo-io/takomo/issues/124)) ([cc830b4](https://github.com/takomo-io/takomo/commit/cc830b42253cd3d23c91215e2cf5a49ff94f1b74)), closes [#121](https://github.com/takomo-io/takomo/issues/121)





# [2.11.0](https://github.com/takomo-io/takomo/compare/v2.10.1...v2.11.0) (2020-10-17)


### Features

* add CLI commands to create and delete account aliases ([#119](https://github.com/takomo-io/takomo/issues/119)) ([56571e4](https://github.com/takomo-io/takomo/commit/56571e45e8e6b52976c5f4323c20e9e3a8280b2f)), closes [#75](https://github.com/takomo-io/takomo/issues/75)





# [2.10.0](https://github.com/takomo-io/takomo/compare/v2.9.0...v2.10.0) (2020-10-11)


### Bug Fixes

* fix reviewing of stacks whose template uses 'AWS::Serverless-2016-10-31' transformation ([#113](https://github.com/takomo-io/takomo/issues/113)) ([5f1df87](https://github.com/takomo-io/takomo/commit/5f1df87fe8a65df8345bac2eb8cfdc8d90266043)), closes [#112](https://github.com/takomo-io/takomo/issues/112)





# [2.9.0](https://github.com/takomo-io/takomo/compare/v2.8.0...v2.9.0) (2020-10-09)

**Note:** Version bump only for package @takomo/aws-clients





# [2.8.0](https://github.com/takomo-io/takomo/compare/v2.7.4...v2.8.0) (2020-10-05)

**Note:** Version bump only for package @takomo/aws-clients





## [2.7.4](https://github.com/takomo-io/takomo/compare/v2.7.3...v2.7.4) (2020-09-27)

**Note:** Version bump only for package @takomo/aws-clients





## [2.7.3](https://github.com/takomo-io/takomo/compare/v2.7.2...v2.7.3) (2020-09-21)


### Bug Fixes

* fix failing tests ([#100](https://github.com/takomo-io/takomo/issues/100)) ([6f8dba4](https://github.com/takomo-io/takomo/commit/6f8dba4b1464d7b84c257e03b5796479bf26a708))





## [2.7.2](https://github.com/takomo-io/takomo/compare/v2.7.1...v2.7.2) (2020-09-07)


### Bug Fixes

* fix retrying of requests to AWS APIs ([#98](https://github.com/takomo-io/takomo/issues/98)) ([7c22d27](https://github.com/takomo-io/takomo/commit/7c22d27477eca873ff195e71a6c07245c97d4fe7)), closes [#89](https://github.com/takomo-io/takomo/issues/89)





## [2.7.1](https://github.com/takomo-io/takomo/compare/v2.7.0...v2.7.1) (2020-09-02)


### Bug Fixes

* fix handling of failed change set creation ([#97](https://github.com/takomo-io/takomo/issues/97)) ([a81d514](https://github.com/takomo-io/takomo/commit/a81d5148c154044cebdc33eaf42fb87adfbe4074)), closes [#96](https://github.com/takomo-io/takomo/issues/96)





# [2.7.0](https://github.com/takomo-io/takomo/compare/v2.6.2...v2.7.0) (2020-08-31)


### Features

* optimize AWS API calls to minimize throttling ([#93](https://github.com/takomo-io/takomo/issues/93)) ([e05ad1f](https://github.com/takomo-io/takomo/commit/e05ad1ff3fd0902d1509b1feaa51ebb4383fb18b)), closes [#79](https://github.com/takomo-io/takomo/issues/79)





## [2.6.1](https://github.com/takomo-io/takomo/compare/v2.6.0...v2.6.1) (2020-08-20)


### Bug Fixes

* adjust throttling of AWS API calls ([da547ef](https://github.com/takomo-io/takomo/commit/da547efd835539ebdabc37e163d492bbf95662ce)), closes [#78](https://github.com/takomo-io/takomo/issues/78)





# [2.5.0](https://github.com/takomo-io/takomo/compare/v2.4.0...v2.5.0) (2020-07-28)


### Features

* improve organization deployment ([#72](https://github.com/takomo-io/takomo/issues/72)) ([6104896](https://github.com/takomo-io/takomo/commit/6104896c1b90654ddb0e63de2703a7327d997c85)), closes [#71](https://github.com/takomo-io/takomo/issues/71)





# [2.4.0](https://github.com/takomo-io/takomo/compare/v2.3.0...v2.4.0) (2020-07-07)

**Note:** Version bump only for package @takomo/aws-clients





# [2.3.0](https://github.com/takomo-io/takomo/compare/v2.2.1...v2.3.0) (2020-07-02)

**Note:** Version bump only for package @takomo/aws-clients





# [2.2.0](https://github.com/takomo-io/takomo/compare/v2.1.0...v2.2.0) (2020-06-26)


### Features

* show changed stack parameters on stack deployment review phase ([#55](https://github.com/takomo-io/takomo/issues/55)) ([8c45809](https://github.com/takomo-io/takomo/commit/8c458090536b9f16b7f1873be94bdcd738264361)), closes [#52](https://github.com/takomo-io/takomo/issues/52)





# [2.1.0](https://github.com/takomo-io/takomo/compare/v2.0.0...v2.1.0) (2020-06-21)

**Note:** Version bump only for package @takomo/aws-clients





# [2.0.0](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.1...v2.0.0) (2020-06-15)

**Note:** Version bump only for package @takomo/aws-clients





# [2.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2020-06-15)

**Note:** Version bump only for package @takomo/aws-clients





# [2.0.0-alpha.0](https://github.com/takomo-io/takomo/compare/v1.3.1...v2.0.0-alpha.0) (2020-06-15)


### Features

* require nodejs version 14.4.0 ([#50](https://github.com/takomo-io/takomo/issues/50)) ([da186b4](https://github.com/takomo-io/takomo/commit/da186b44aadee05fb1478f21a536d0c7b6343553)), closes [#46](https://github.com/takomo-io/takomo/issues/46)


### BREAKING CHANGES

* Takomo now requires nodejs version 14.4.0





# [1.3.0](https://github.com/takomo-io/takomo/compare/v1.2.1...v1.3.0) (2020-06-09)

**Note:** Version bump only for package @takomo/aws-clients





## [1.2.1](https://github.com/takomo-io/takomo/compare/v1.2.0...v1.2.1) (2020-05-29)

**Note:** Version bump only for package @takomo/aws-clients





# [1.2.0](https://github.com/takomo-io/takomo/compare/v1.1.0...v1.2.0) (2020-05-28)

**Note:** Version bump only for package @takomo/aws-clients





# [1.1.0](https://github.com/takomo-io/takomo/compare/v1.0.0...v1.1.0) (2020-05-18)

**Note:** Version bump only for package @takomo/aws-clients





# [1.0.0](https://github.com/takomo-io/takomo/compare/v0.2.0...v1.0.0) (2020-05-12)


### Features

* change timeout to use seconds instead of minutes ([#16](https://github.com/takomo-io/takomo/issues/16)) ([7419103](https://github.com/takomo-io/takomo/commit/74191036e27d31ef9f4cd23dd908c9e737217204)), closes [#15](https://github.com/takomo-io/takomo/issues/15)
* load existing stacks before proceeding to deploy/undeploy ([#20](https://github.com/takomo-io/takomo/issues/20)) ([082bf26](https://github.com/takomo-io/takomo/commit/082bf263830eb2996b62331c565b4fae2b9a1770)), closes [#19](https://github.com/takomo-io/takomo/issues/19)


### BREAKING CHANGES

* Timeout is now configured in seconds instead of minutes





# [0.2.0](https://github.com/takomo-io/takomo/compare/v0.1.0...v0.2.0) (2020-05-07)


### Bug Fixes

* correct ordering of stack events during stack deploy/undeploy operations ([cc7dd4f](https://github.com/takomo-io/takomo/commit/cc7dd4f2ec3b8708d31d5e80574bdc7750d01818)), closes [#7](https://github.com/takomo-io/takomo/issues/7)





# [0.1.0](https://github.com/takomo-io/takomo/compare/v0.0.2...v0.1.0) (2020-05-06)

**Note:** Version bump only for package @takomo/aws-clients





## 0.0.2 (2020-05-04)

**Note:** Version bump only for package @takomo/aws-clients
