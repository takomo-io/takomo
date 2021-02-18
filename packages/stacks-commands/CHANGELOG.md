# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.2.1](https://github.com/takomo-io/takomo/compare/v3.2.0...v3.2.1) (2021-02-18)


### Bug Fixes

* fix a bug in undeploy stacks command ([#155](https://github.com/takomo-io/takomo/issues/155)) ([046370b](https://github.com/takomo-io/takomo/commit/046370bba580bf07bca46904c4505e593d7c1d19)), closes [#154](https://github.com/takomo-io/takomo/issues/154)





# [3.2.0](https://github.com/takomo-io/takomo/compare/v3.1.0...v3.2.0) (2021-02-16)

**Note:** Version bump only for package @takomo/stacks-commands





# [3.1.0](https://github.com/takomo-io/takomo/compare/v3.0.1...v3.1.0) (2021-02-14)


### Features

* add support to register custom Joi schemas that can be used to validate configuration ([#139](https://github.com/takomo-io/takomo/issues/139)) ([e9b6447](https://github.com/takomo-io/takomo/commit/e9b64475d0c4ff4b81694aa333560311fa6ce18f)), closes [#137](https://github.com/takomo-io/takomo/issues/137)
* implement loading of accounts from external repository ([#142](https://github.com/takomo-io/takomo/issues/142)) ([953250e](https://github.com/takomo-io/takomo/commit/953250e57b6f0c3349cf94d2636619f9521682c4)), closes [#140](https://github.com/takomo-io/takomo/issues/140)





## [3.0.1](https://github.com/takomo-io/takomo/compare/v3.0.0...v3.0.1) (2021-01-31)

**Note:** Version bump only for package @takomo/stacks-commands





# [3.0.0](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.5...v3.0.0) (2021-01-23)

**Note:** Version bump only for package @takomo/stacks-commands





# [3.0.0-alpha.5](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2021-01-20)


### Bug Fixes

* fix handling of parameters with default values, change set review details ([9ba7012](https://github.com/takomo-io/takomo/commit/9ba70127a6940fec649f922161a280c7965f71e6))





# [3.0.0-alpha.4](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2021-01-18)


### Bug Fixes

* fix inheritance of tags ([edfd5e7](https://github.com/takomo-io/takomo/commit/edfd5e75b1b3221fe4c0ffe4f7f1a882aec0c0c6))


### Features

* add option to disabled dynamic template processing ([efa59aa](https://github.com/takomo-io/takomo/commit/efa59aa9ad13226b284faf5a6c080c02d966079a))





# [3.0.0-alpha.2](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2021-01-17)

**Note:** Version bump only for package @takomo/stacks-commands





# [3.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2021-01-15)


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

**Note:** Version bump only for package @takomo/stacks-commands





# [2.12.0](https://github.com/takomo-io/takomo/compare/v2.11.1...v2.12.0) (2020-10-30)


### Features

* add additional file extensions for dynamic stack templates ([#131](https://github.com/takomo-io/takomo/issues/131)) ([3a69873](https://github.com/takomo-io/takomo/commit/3a6987344d4224649b7b8a47530a9282bf53cd8c)), closes [#127](https://github.com/takomo-io/takomo/issues/127)
* expose stack parameters to Handlebars stack template ([#130](https://github.com/takomo-io/takomo/issues/130)) ([7d22f06](https://github.com/takomo-io/takomo/commit/7d22f06559975204ae1b380db0c02f97d2a585cc)), closes [#125](https://github.com/takomo-io/takomo/issues/125)





## [2.11.1](https://github.com/takomo-io/takomo/compare/v2.11.0...v2.11.1) (2020-10-20)

**Note:** Version bump only for package @takomo/stacks-commands





# [2.11.0](https://github.com/takomo-io/takomo/compare/v2.10.1...v2.11.0) (2020-10-17)

**Note:** Version bump only for package @takomo/stacks-commands





## [2.10.1](https://github.com/takomo-io/takomo/compare/v2.10.0...v2.10.1) (2020-10-13)

**Note:** Version bump only for package @takomo/stacks-commands





# [2.10.0](https://github.com/takomo-io/takomo/compare/v2.9.0...v2.10.0) (2020-10-11)


### Bug Fixes

* fix reviewing of stacks whose template uses 'AWS::Serverless-2016-10-31' transformation ([#113](https://github.com/takomo-io/takomo/issues/113)) ([5f1df87](https://github.com/takomo-io/takomo/commit/5f1df87fe8a65df8345bac2eb8cfdc8d90266043)), closes [#112](https://github.com/takomo-io/takomo/issues/112)


### Features

* add CLI command to show stacks dependency graph ([#116](https://github.com/takomo-io/takomo/issues/116)) ([20c00f2](https://github.com/takomo-io/takomo/commit/20c00f2a7f71c62f514fea72d24c6be9c1218b42)), closes [#115](https://github.com/takomo-io/takomo/issues/115)





# [2.9.0](https://github.com/takomo-io/takomo/compare/v2.8.0...v2.9.0) (2020-10-09)


### Features

* add stack statuses related to importing of resources to stacks to stack status validation ([#108](https://github.com/takomo-io/takomo/issues/108)) ([27d95ae](https://github.com/takomo-io/takomo/commit/27d95ae977d7270703befab0809925cb69f37cdd)), closes [#107](https://github.com/takomo-io/takomo/issues/107)





# [2.8.0](https://github.com/takomo-io/takomo/compare/v2.7.4...v2.8.0) (2020-10-05)


### Features

* improve loading of configuration files ([#105](https://github.com/takomo-io/takomo/issues/105)) ([574dd64](https://github.com/takomo-io/takomo/commit/574dd64b7ca6a216d57fc426467eb6570cc2f2a3)), closes [#104](https://github.com/takomo-io/takomo/issues/104)





## [2.7.4](https://github.com/takomo-io/takomo/compare/v2.7.3...v2.7.4) (2020-09-27)

**Note:** Version bump only for package @takomo/stacks-commands





## [2.7.3](https://github.com/takomo-io/takomo/compare/v2.7.2...v2.7.3) (2020-09-21)

**Note:** Version bump only for package @takomo/stacks-commands





## [2.7.2](https://github.com/takomo-io/takomo/compare/v2.7.1...v2.7.2) (2020-09-07)

**Note:** Version bump only for package @takomo/stacks-commands





## [2.7.1](https://github.com/takomo-io/takomo/compare/v2.7.0...v2.7.1) (2020-09-02)


### Bug Fixes

* fix handling of failed change set creation ([#97](https://github.com/takomo-io/takomo/issues/97)) ([a81d514](https://github.com/takomo-io/takomo/commit/a81d5148c154044cebdc33eaf42fb87adfbe4074)), closes [#96](https://github.com/takomo-io/takomo/issues/96)





# [2.7.0](https://github.com/takomo-io/takomo/compare/v2.6.2...v2.7.0) (2020-08-31)


### Bug Fixes

* add logic to handle stacks with termination protection enabled on undeploy ([#95](https://github.com/takomo-io/takomo/issues/95)) ([4093189](https://github.com/takomo-io/takomo/commit/409318968058ef9554afe8d23749efe6109446f4)), closes [#87](https://github.com/takomo-io/takomo/issues/87)


### Features

* expose stack object to stack template file ([#94](https://github.com/takomo-io/takomo/issues/94)) ([13c8fd0](https://github.com/takomo-io/takomo/commit/13c8fd09831a668a841abd09df6b011ee258dbff)), closes [#91](https://github.com/takomo-io/takomo/issues/91)





## [2.6.1](https://github.com/takomo-io/takomo/compare/v2.6.0...v2.6.1) (2020-08-20)

**Note:** Version bump only for package @takomo/stacks-commands





# [2.6.0](https://github.com/takomo-io/takomo/compare/v2.5.0...v2.6.0) (2020-08-18)

**Note:** Version bump only for package @takomo/stacks-commands





# [2.5.0](https://github.com/takomo-io/takomo/compare/v2.4.0...v2.5.0) (2020-07-28)


### Features

* improve organization deployment ([#72](https://github.com/takomo-io/takomo/issues/72)) ([6104896](https://github.com/takomo-io/takomo/commit/6104896c1b90654ddb0e63de2703a7327d997c85)), closes [#71](https://github.com/takomo-io/takomo/issues/71)





# [2.4.0](https://github.com/takomo-io/takomo/compare/v2.3.0...v2.4.0) (2020-07-07)


### Features

* update prompts used to ask input from user ([#62](https://github.com/takomo-io/takomo/issues/62)) ([ff98787](https://github.com/takomo-io/takomo/commit/ff98787f3184246511a55496975321ff33d9598a)), closes [#31](https://github.com/takomo-io/takomo/issues/31)





# [2.3.0](https://github.com/takomo-io/takomo/compare/v2.2.1...v2.3.0) (2020-07-02)

**Note:** Version bump only for package @takomo/stacks-commands





# [2.2.0](https://github.com/takomo-io/takomo/compare/v2.1.0...v2.2.0) (2020-06-26)


### Bug Fixes

* fix handling of stacks in invalid state on the next attempt to create the stacks ([#56](https://github.com/takomo-io/takomo/issues/56)) ([78fbc2f](https://github.com/takomo-io/takomo/commit/78fbc2fb7783aa687ff2cd8257711586d569c7f9)), closes [#54](https://github.com/takomo-io/takomo/issues/54)


### Features

* show changed stack parameters on stack deployment review phase ([#55](https://github.com/takomo-io/takomo/issues/55)) ([8c45809](https://github.com/takomo-io/takomo/commit/8c458090536b9f16b7f1873be94bdcd738264361)), closes [#52](https://github.com/takomo-io/takomo/issues/52)





# [2.1.0](https://github.com/takomo-io/takomo/compare/v2.0.0...v2.1.0) (2020-06-21)

**Note:** Version bump only for package @takomo/stacks-commands





# [2.0.0](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.1...v2.0.0) (2020-06-15)

**Note:** Version bump only for package @takomo/stacks-commands





# [2.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2020-06-15)

**Note:** Version bump only for package @takomo/stacks-commands





# [2.0.0-alpha.0](https://github.com/takomo-io/takomo/compare/v1.3.1...v2.0.0-alpha.0) (2020-06-15)


### Features

* require nodejs version 14.4.0 ([#50](https://github.com/takomo-io/takomo/issues/50)) ([da186b4](https://github.com/takomo-io/takomo/commit/da186b44aadee05fb1478f21a536d0c7b6343553)), closes [#46](https://github.com/takomo-io/takomo/issues/46)


### BREAKING CHANGES

* Takomo now requires nodejs version 14.4.0





# [1.3.0](https://github.com/takomo-io/takomo/compare/v1.2.1...v1.3.0) (2020-06-09)

**Note:** Version bump only for package @takomo/stacks-commands





## [1.2.1](https://github.com/takomo-io/takomo/compare/v1.2.0...v1.2.1) (2020-05-29)

**Note:** Version bump only for package @takomo/stacks-commands





# [1.2.0](https://github.com/takomo-io/takomo/compare/v1.1.0...v1.2.0) (2020-05-28)

**Note:** Version bump only for package @takomo/stacks-commands





# [1.1.0](https://github.com/takomo-io/takomo/compare/v1.0.0...v1.1.0) (2020-05-18)


### Bug Fixes

* convert variables of type Map to objects when exposing them in Handlebars templates ([#28](https://github.com/takomo-io/takomo/issues/28)) ([1fdeae4](https://github.com/takomo-io/takomo/commit/1fdeae46faa5b6296c4daf1ef31b46fa8b0dfc68)), closes [#27](https://github.com/takomo-io/takomo/issues/27)


### Features

* show required minimum IAM policy in command specific help ([#26](https://github.com/takomo-io/takomo/issues/26)) ([177cf3f](https://github.com/takomo-io/takomo/commit/177cf3fba016b33e8009cb62e6f715ddc25dc4b9)), closes [#23](https://github.com/takomo-io/takomo/issues/23)





# [1.0.0](https://github.com/takomo-io/takomo/compare/v0.2.0...v1.0.0) (2020-05-12)


### Features

* load existing stacks before proceeding to deploy/undeploy ([#20](https://github.com/takomo-io/takomo/issues/20)) ([082bf26](https://github.com/takomo-io/takomo/commit/082bf263830eb2996b62331c565b4fae2b9a1770)), closes [#19](https://github.com/takomo-io/takomo/issues/19)
* parameter resolver enhancements ([#12](https://github.com/takomo-io/takomo/issues/12)) ([a54d2d0](https://github.com/takomo-io/takomo/commit/a54d2d05c93a17364cc61d0606a8d9dc62aa8187)), closes [#10](https://github.com/takomo-io/takomo/issues/10)


### BREAKING CHANGES

* Parameter resolver API and custom resolver configuration file have changed
