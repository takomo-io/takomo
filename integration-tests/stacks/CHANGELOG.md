# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.2.0](https://github.com/takomo-io/takomo/compare/v3.1.0...v3.2.0) (2021-02-16)


### Features

* add support for relative stack paths ([#149](https://github.com/takomo-io/takomo/issues/149)) ([33854d0](https://github.com/takomo-io/takomo/commit/33854d0c23fc54a618d496fc9b8d8f6e318e70eb)), closes [#53](https://github.com/takomo-io/takomo/issues/53)





# [3.1.0](https://github.com/takomo-io/takomo/compare/v3.0.1...v3.1.0) (2021-02-14)


### Features

* add support to register custom Joi schemas that can be used to validate configuration ([#139](https://github.com/takomo-io/takomo/issues/139)) ([e9b6447](https://github.com/takomo-io/takomo/commit/e9b64475d0c4ff4b81694aa333560311fa6ce18f)), closes [#137](https://github.com/takomo-io/takomo/issues/137)





## [3.0.1](https://github.com/takomo-io/takomo/compare/v3.0.0...v3.0.1) (2021-01-31)

**Note:** Version bump only for package integration-test-stacks





# [3.0.0](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.5...v3.0.0) (2021-01-23)

**Note:** Version bump only for package integration-test-stacks





# [3.0.0-alpha.5](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2021-01-20)


### Bug Fixes

* fix handling of parameters with default values, change set review details ([9ba7012](https://github.com/takomo-io/takomo/commit/9ba70127a6940fec649f922161a280c7965f71e6))





# [3.0.0-alpha.4](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2021-01-18)


### Bug Fixes

* fix inheritance of tags ([edfd5e7](https://github.com/takomo-io/takomo/commit/edfd5e75b1b3221fe4c0ffe4f7f1a882aec0c0c6))


### Features

* add option to disabled dynamic template processing ([efa59aa](https://github.com/takomo-io/takomo/commit/efa59aa9ad13226b284faf5a6c080c02d966079a))





# [3.0.0-alpha.3](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2021-01-17)

**Note:** Version bump only for package integration-test-stacks





# [3.0.0-alpha.2](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2021-01-17)

**Note:** Version bump only for package integration-test-stacks





# [3.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2021-01-15)


### Bug Fixes

* fix failing tests ([2c26156](https://github.com/takomo-io/takomo/commit/2c2615638348f01864bf4f39250c42f75f91b8f2))


### Features

* improve error handling and validation ([bca09ed](https://github.com/takomo-io/takomo/commit/bca09ed5b88ee6148122a380be29e929dcb5b8b5))





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

**Note:** Version bump only for package integration-test-stacks





# [2.12.0](https://github.com/takomo-io/takomo/compare/v2.11.1...v2.12.0) (2020-10-30)


### Features

* add additional file extensions for dynamic stack templates ([#131](https://github.com/takomo-io/takomo/issues/131)) ([3a69873](https://github.com/takomo-io/takomo/commit/3a6987344d4224649b7b8a47530a9282bf53cd8c)), closes [#127](https://github.com/takomo-io/takomo/issues/127)
* expose stack parameters to Handlebars stack template ([#130](https://github.com/takomo-io/takomo/issues/130)) ([7d22f06](https://github.com/takomo-io/takomo/commit/7d22f06559975204ae1b380db0c02f97d2a585cc)), closes [#125](https://github.com/takomo-io/takomo/issues/125)





## [2.11.1](https://github.com/takomo-io/takomo/compare/v2.11.0...v2.11.1) (2020-10-20)


### Bug Fixes

* fix schema validation of resolvers ([#123](https://github.com/takomo-io/takomo/issues/123)) ([c035cc1](https://github.com/takomo-io/takomo/commit/c035cc1c55b92d5112fa566d362140cd2aa70c77)), closes [#122](https://github.com/takomo-io/takomo/issues/122)





# [2.11.0](https://github.com/takomo-io/takomo/compare/v2.10.1...v2.11.0) (2020-10-17)

**Note:** Version bump only for package integration-test-stacks





## [2.10.1](https://github.com/takomo-io/takomo/compare/v2.10.0...v2.10.1) (2020-10-13)

**Note:** Version bump only for package integration-test-stacks





# [2.10.0](https://github.com/takomo-io/takomo/compare/v2.9.0...v2.10.0) (2020-10-11)


### Bug Fixes

* fix reviewing of stacks whose template uses 'AWS::Serverless-2016-10-31' transformation ([#113](https://github.com/takomo-io/takomo/issues/113)) ([5f1df87](https://github.com/takomo-io/takomo/commit/5f1df87fe8a65df8345bac2eb8cfdc8d90266043)), closes [#112](https://github.com/takomo-io/takomo/issues/112)





# [2.9.0](https://github.com/takomo-io/takomo/compare/v2.8.0...v2.9.0) (2020-10-09)

**Note:** Version bump only for package integration-test-stacks





# [2.8.0](https://github.com/takomo-io/takomo/compare/v2.7.4...v2.8.0) (2020-10-05)


### Features

* improve loading of configuration files ([#105](https://github.com/takomo-io/takomo/issues/105)) ([574dd64](https://github.com/takomo-io/takomo/commit/574dd64b7ca6a216d57fc426467eb6570cc2f2a3)), closes [#104](https://github.com/takomo-io/takomo/issues/104)
* validate command path using new configuration tree ([#106](https://github.com/takomo-io/takomo/issues/106)) ([c8d60a8](https://github.com/takomo-io/takomo/commit/c8d60a84c8b357346db6f18a8648d64ec20f2187))





## [2.7.4](https://github.com/takomo-io/takomo/compare/v2.7.3...v2.7.4) (2020-09-27)

**Note:** Version bump only for package integration-test-stacks





## [2.7.3](https://github.com/takomo-io/takomo/compare/v2.7.2...v2.7.3) (2020-09-21)


### Bug Fixes

* fix failing tests ([#100](https://github.com/takomo-io/takomo/issues/100)) ([6f8dba4](https://github.com/takomo-io/takomo/commit/6f8dba4b1464d7b84c257e03b5796479bf26a708))





## [2.7.2](https://github.com/takomo-io/takomo/compare/v2.7.1...v2.7.2) (2020-09-07)

**Note:** Version bump only for package integration-test-stacks





## [2.7.1](https://github.com/takomo-io/takomo/compare/v2.7.0...v2.7.1) (2020-09-02)


### Bug Fixes

* fix handling of failed change set creation ([#97](https://github.com/takomo-io/takomo/issues/97)) ([a81d514](https://github.com/takomo-io/takomo/commit/a81d5148c154044cebdc33eaf42fb87adfbe4074)), closes [#96](https://github.com/takomo-io/takomo/issues/96)





# [2.7.0](https://github.com/takomo-io/takomo/compare/v2.6.2...v2.7.0) (2020-08-31)


### Bug Fixes

* add logic to handle stacks with termination protection enabled on undeploy ([#95](https://github.com/takomo-io/takomo/issues/95)) ([4093189](https://github.com/takomo-io/takomo/commit/409318968058ef9554afe8d23749efe6109446f4)), closes [#87](https://github.com/takomo-io/takomo/issues/87)





## [2.6.2](https://github.com/takomo-io/takomo/compare/v2.6.1...v2.6.2) (2020-08-27)

**Note:** Version bump only for package integration-test-stacks





## [2.6.1](https://github.com/takomo-io/takomo/compare/v2.6.0...v2.6.1) (2020-08-20)

**Note:** Version bump only for package integration-test-stacks





# [2.6.0](https://github.com/takomo-io/takomo/compare/v2.5.0...v2.6.0) (2020-08-18)

**Note:** Version bump only for package integration-test-stacks





# [2.5.0](https://github.com/takomo-io/takomo/compare/v2.4.0...v2.5.0) (2020-07-28)


### Features

* improve organization deployment ([#72](https://github.com/takomo-io/takomo/issues/72)) ([6104896](https://github.com/takomo-io/takomo/commit/6104896c1b90654ddb0e63de2703a7327d997c85)), closes [#71](https://github.com/takomo-io/takomo/issues/71)





# [2.4.0](https://github.com/takomo-io/takomo/compare/v2.3.0...v2.4.0) (2020-07-07)


### Features

* update prompts used to ask input from user ([#62](https://github.com/takomo-io/takomo/issues/62)) ([ff98787](https://github.com/takomo-io/takomo/commit/ff98787f3184246511a55496975321ff33d9598a)), closes [#31](https://github.com/takomo-io/takomo/issues/31)





# [2.3.0](https://github.com/takomo-io/takomo/compare/v2.2.1...v2.3.0) (2020-07-02)

**Note:** Version bump only for package integration-test-stacks





# [2.2.0](https://github.com/takomo-io/takomo/compare/v2.1.0...v2.2.0) (2020-06-26)


### Features

* show changed stack parameters on stack deployment review phase ([#55](https://github.com/takomo-io/takomo/issues/55)) ([8c45809](https://github.com/takomo-io/takomo/commit/8c458090536b9f16b7f1873be94bdcd738264361)), closes [#52](https://github.com/takomo-io/takomo/issues/52)





# [2.1.0](https://github.com/takomo-io/takomo/compare/v2.0.0...v2.1.0) (2020-06-21)

**Note:** Version bump only for package integration-test-stacks





# [2.0.0](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.1...v2.0.0) (2020-06-15)

**Note:** Version bump only for package integration-test-stacks





# [2.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2020-06-15)

**Note:** Version bump only for package integration-test-stacks





# [2.0.0-alpha.0](https://github.com/takomo-io/takomo/compare/v1.3.1...v2.0.0-alpha.0) (2020-06-15)


### Features

* require nodejs version 14.4.0 ([#50](https://github.com/takomo-io/takomo/issues/50)) ([da186b4](https://github.com/takomo-io/takomo/commit/da186b44aadee05fb1478f21a536d0c7b6343553)), closes [#46](https://github.com/takomo-io/takomo/issues/46)


### BREAKING CHANGES

* Takomo now requires nodejs version 14.4.0





## [1.3.1](https://github.com/takomo-io/takomo/compare/v1.3.0...v1.3.1) (2020-06-14)

**Note:** Version bump only for package integration-test-stacks





# [1.3.0](https://github.com/takomo-io/takomo/compare/v1.2.1...v1.3.0) (2020-06-09)


### Features

* add cli command to initialize a new project ([#43](https://github.com/takomo-io/takomo/issues/43)) ([7a11d55](https://github.com/takomo-io/takomo/commit/7a11d55b6e19fd46e59d614b514abe1cef2a66c3))





## [1.2.1](https://github.com/takomo-io/takomo/compare/v1.2.0...v1.2.1) (2020-05-29)

**Note:** Version bump only for package integration-test-stacks





# [1.2.0](https://github.com/takomo-io/takomo/compare/v1.1.0...v1.2.0) (2020-05-28)

**Note:** Version bump only for package integration-test-stacks





# [1.1.0](https://github.com/takomo-io/takomo/compare/v1.0.0...v1.1.0) (2020-05-18)


### Bug Fixes

* convert variables of type Map to objects when exposing them in Handlebars templates ([#28](https://github.com/takomo-io/takomo/issues/28)) ([1fdeae4](https://github.com/takomo-io/takomo/commit/1fdeae46faa5b6296c4daf1ef31b46fa8b0dfc68)), closes [#27](https://github.com/takomo-io/takomo/issues/27)





# [1.0.0](https://github.com/takomo-io/takomo/compare/v0.2.0...v1.0.0) (2020-05-12)


### Features

* change timeout to use seconds instead of minutes ([#16](https://github.com/takomo-io/takomo/issues/16)) ([7419103](https://github.com/takomo-io/takomo/commit/74191036e27d31ef9f4cd23dd908c9e737217204)), closes [#15](https://github.com/takomo-io/takomo/issues/15)
* load existing stacks before proceeding to deploy/undeploy ([#20](https://github.com/takomo-io/takomo/issues/20)) ([082bf26](https://github.com/takomo-io/takomo/commit/082bf263830eb2996b62331c565b4fae2b9a1770)), closes [#19](https://github.com/takomo-io/takomo/issues/19)
* parameter resolver enhancements ([#12](https://github.com/takomo-io/takomo/issues/12)) ([a54d2d0](https://github.com/takomo-io/takomo/commit/a54d2d05c93a17364cc61d0606a8d9dc62aa8187)), closes [#10](https://github.com/takomo-io/takomo/issues/10)


### BREAKING CHANGES

* Timeout is now configured in seconds instead of minutes
* Parameter resolver API and custom resolver configuration file have changed





# [0.2.0](https://github.com/takomo-io/takomo/compare/v0.1.0...v0.2.0) (2020-05-07)

**Note:** Version bump only for package integration-test-stacks





# [0.1.0](https://github.com/takomo-io/takomo/compare/v0.0.2...v0.1.0) (2020-05-06)

**Note:** Version bump only for package integration-test-stacks





## 0.0.2 (2020-05-04)

**Note:** Version bump only for package integration-test-stacks
