# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.11.0](https://github.com/takomo-io/takomo/compare/v3.10.0...v3.11.0) (2021-04-20)


### Features

* **stacks:** expose stack group parent in stack config file ([#209](https://github.com/takomo-io/takomo/issues/209)) ([b3b8109](https://github.com/takomo-io/takomo/commit/b3b8109d5d9cd6f73ff077b15e9295e38d233ed9)), closes [#208](https://github.com/takomo-io/takomo/issues/208)





# [3.9.0](https://github.com/takomo-io/takomo/compare/v3.8.0...v3.9.0) (2021-04-12)


### Features

* optimize stack event polling to minimize requests towards AWS APIs ([52715a6](https://github.com/takomo-io/takomo/commit/52715a64dfc7d70b3ba4acce07300421a9300ef9))





# [3.8.0](https://github.com/takomo-io/takomo/compare/v3.7.0...v3.8.0) (2021-04-08)

**Note:** Version bump only for package @takomo/stacks-context





# [3.7.0](https://github.com/takomo-io/takomo/compare/v3.6.0...v3.7.0) (2021-04-01)


### Features

* **credentials:** implement support for MFA when initializing default credentials ([#195](https://github.com/takomo-io/takomo/issues/195)) ([3a2b3dd](https://github.com/takomo-io/takomo/commit/3a2b3dd67aaa9832617c6c997b8c895643de0893)), closes [#194](https://github.com/takomo-io/takomo/issues/194)





# [3.6.0](https://github.com/takomo-io/takomo/compare/v3.5.1...v3.6.0) (2021-03-28)

**Note:** Version bump only for package @takomo/stacks-context





## [3.5.1](https://github.com/takomo-io/takomo/compare/v3.5.0...v3.5.1) (2021-03-22)

**Note:** Version bump only for package @takomo/stacks-context





# [3.5.0](https://github.com/takomo-io/takomo/compare/v3.4.2...v3.5.0) (2021-03-21)

**Note:** Version bump only for package @takomo/stacks-context





# [3.4.0](https://github.com/takomo-io/takomo/compare/v3.3.0...v3.4.0) (2021-03-08)


### Features

* add support to load custom parameter resolvers from NPM packages ([#164](https://github.com/takomo-io/takomo/issues/164)) ([8d1a5e8](https://github.com/takomo-io/takomo/commit/8d1a5e8b8786804b39dd0ade31954c6c2d159385)), closes [#163](https://github.com/takomo-io/takomo/issues/163)





# [3.3.0](https://github.com/takomo-io/takomo/compare/v3.2.2...v3.3.0) (2021-02-22)

**Note:** Version bump only for package @takomo/stacks-context





## [3.2.2](https://github.com/takomo-io/takomo/compare/v3.2.1...v3.2.2) (2021-02-20)


### Bug Fixes

* fix validating of allowed accounts when undeploying stacks ([#158](https://github.com/takomo-io/takomo/issues/158)) ([807605d](https://github.com/takomo-io/takomo/commit/807605d2e8befad7a9567f74fb40b253bbbf76cb)), closes [#157](https://github.com/takomo-io/takomo/issues/157)





## [3.2.1](https://github.com/takomo-io/takomo/compare/v3.2.0...v3.2.1) (2021-02-18)

**Note:** Version bump only for package @takomo/stacks-context





# [3.2.0](https://github.com/takomo-io/takomo/compare/v3.1.0...v3.2.0) (2021-02-16)


### Features

* add support for relative stack paths ([#149](https://github.com/takomo-io/takomo/issues/149)) ([33854d0](https://github.com/takomo-io/takomo/commit/33854d0c23fc54a618d496fc9b8d8f6e318e70eb)), closes [#53](https://github.com/takomo-io/takomo/issues/53)





# [3.1.0](https://github.com/takomo-io/takomo/compare/v3.0.1...v3.1.0) (2021-02-14)


### Bug Fixes

* fix imports ([a7df59b](https://github.com/takomo-io/takomo/commit/a7df59b88690b2fcb844bf177014b55b0e0745e3))


### Features

* add support to register custom Joi schemas that can be used to validate configuration ([#139](https://github.com/takomo-io/takomo/issues/139)) ([e9b6447](https://github.com/takomo-io/takomo/commit/e9b64475d0c4ff4b81694aa333560311fa6ce18f)), closes [#137](https://github.com/takomo-io/takomo/issues/137)
* implement loading of accounts from external repository ([#142](https://github.com/takomo-io/takomo/issues/142)) ([953250e](https://github.com/takomo-io/takomo/commit/953250e57b6f0c3349cf94d2636619f9521682c4)), closes [#140](https://github.com/takomo-io/takomo/issues/140)





## [3.0.1](https://github.com/takomo-io/takomo/compare/v3.0.0...v3.0.1) (2021-01-31)

**Note:** Version bump only for package @takomo/stacks-context





# [3.0.0](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.5...v3.0.0) (2021-01-23)

**Note:** Version bump only for package @takomo/stacks-context





# [3.0.0-alpha.5](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2021-01-20)

**Note:** Version bump only for package @takomo/stacks-context





# [3.0.0-alpha.4](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2021-01-18)


### Bug Fixes

* fix inheritance of tags ([edfd5e7](https://github.com/takomo-io/takomo/commit/edfd5e75b1b3221fe4c0ffe4f7f1a882aec0c0c6))
* fix tests ([96fd0e0](https://github.com/takomo-io/takomo/commit/96fd0e0599a407479ec0fd48f3a6cb77da2881a5))


### Features

* add option to disabled dynamic template processing ([efa59aa](https://github.com/takomo-io/takomo/commit/efa59aa9ad13226b284faf5a6c080c02d966079a))





# [3.0.0-alpha.2](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2021-01-17)

**Note:** Version bump only for package @takomo/stacks-context





# [3.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2021-01-15)

**Note:** Version bump only for package @takomo/stacks-context





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

**Note:** Version bump only for package @takomo/stacks-context





## [2.11.1](https://github.com/takomo-io/takomo/compare/v2.11.0...v2.11.1) (2020-10-20)

**Note:** Version bump only for package @takomo/stacks-context





# [2.11.0](https://github.com/takomo-io/takomo/compare/v2.10.1...v2.11.0) (2020-10-17)

**Note:** Version bump only for package @takomo/stacks-context





## [2.10.1](https://github.com/takomo-io/takomo/compare/v2.10.0...v2.10.1) (2020-10-13)


### Bug Fixes

* fix a bug in sorting of stacks for deploy and undeploy ([#117](https://github.com/takomo-io/takomo/issues/117)) ([338ef09](https://github.com/takomo-io/takomo/commit/338ef0917f66cf7df1241dd4a8bce418e3acb615)), closes [#110](https://github.com/takomo-io/takomo/issues/110)





# [2.10.0](https://github.com/takomo-io/takomo/compare/v2.9.0...v2.10.0) (2020-10-11)

**Note:** Version bump only for package @takomo/stacks-context





# [2.9.0](https://github.com/takomo-io/takomo/compare/v2.8.0...v2.9.0) (2020-10-09)

**Note:** Version bump only for package @takomo/stacks-context





# [2.8.0](https://github.com/takomo-io/takomo/compare/v2.7.4...v2.8.0) (2020-10-05)


### Features

* improve loading of configuration files ([#105](https://github.com/takomo-io/takomo/issues/105)) ([574dd64](https://github.com/takomo-io/takomo/commit/574dd64b7ca6a216d57fc426467eb6570cc2f2a3)), closes [#104](https://github.com/takomo-io/takomo/issues/104)
* validate command path using new configuration tree ([#106](https://github.com/takomo-io/takomo/issues/106)) ([c8d60a8](https://github.com/takomo-io/takomo/commit/c8d60a84c8b357346db6f18a8648d64ec20f2187))





## [2.7.4](https://github.com/takomo-io/takomo/compare/v2.7.3...v2.7.4) (2020-09-27)


### Bug Fixes

* fix sorting of stacks ([#101](https://github.com/takomo-io/takomo/issues/101)) ([f7edc91](https://github.com/takomo-io/takomo/commit/f7edc918c49e04128e960aef816084f939273bfb))





## [2.7.3](https://github.com/takomo-io/takomo/compare/v2.7.2...v2.7.3) (2020-09-21)

**Note:** Version bump only for package @takomo/stacks-context





## [2.7.2](https://github.com/takomo-io/takomo/compare/v2.7.1...v2.7.2) (2020-09-07)

**Note:** Version bump only for package @takomo/stacks-context





## [2.7.1](https://github.com/takomo-io/takomo/compare/v2.7.0...v2.7.1) (2020-09-02)


### Bug Fixes

* fix handling of failed change set creation ([#97](https://github.com/takomo-io/takomo/issues/97)) ([a81d514](https://github.com/takomo-io/takomo/commit/a81d5148c154044cebdc33eaf42fb87adfbe4074)), closes [#96](https://github.com/takomo-io/takomo/issues/96)





# [2.7.0](https://github.com/takomo-io/takomo/compare/v2.6.2...v2.7.0) (2020-08-31)


### Features

* expose stack object to stack configuration file ([#90](https://github.com/takomo-io/takomo/issues/90)) ([05a6f2b](https://github.com/takomo-io/takomo/commit/05a6f2b769bad3ac5157b9ffe8243a2b6396703f)), closes [#81](https://github.com/takomo-io/takomo/issues/81)
* optimize AWS API calls to minimize throttling ([#93](https://github.com/takomo-io/takomo/issues/93)) ([e05ad1f](https://github.com/takomo-io/takomo/commit/e05ad1ff3fd0902d1509b1feaa51ebb4383fb18b)), closes [#79](https://github.com/takomo-io/takomo/issues/79)





## [2.6.1](https://github.com/takomo-io/takomo/compare/v2.6.0...v2.6.1) (2020-08-20)

**Note:** Version bump only for package @takomo/stacks-context





# [2.6.0](https://github.com/takomo-io/takomo/compare/v2.5.0...v2.6.0) (2020-08-18)


### Features

* expose stack group name, path and path segments as Handlebars variables into stack group config ([#77](https://github.com/takomo-io/takomo/issues/77)) ([c2a7400](https://github.com/takomo-io/takomo/commit/c2a740085ea90c4677a6bca79ae49079812dce2a)), closes [#76](https://github.com/takomo-io/takomo/issues/76)





# [2.5.0](https://github.com/takomo-io/takomo/compare/v2.4.0...v2.5.0) (2020-07-28)


### Features

* improve organization deployment ([#72](https://github.com/takomo-io/takomo/issues/72)) ([6104896](https://github.com/takomo-io/takomo/commit/6104896c1b90654ddb0e63de2703a7327d997c85)), closes [#71](https://github.com/takomo-io/takomo/issues/71)





# [2.4.0](https://github.com/takomo-io/takomo/compare/v2.3.0...v2.4.0) (2020-07-07)


### Features

* update prompts used to ask input from user ([#62](https://github.com/takomo-io/takomo/issues/62)) ([ff98787](https://github.com/takomo-io/takomo/commit/ff98787f3184246511a55496975321ff33d9598a)), closes [#31](https://github.com/takomo-io/takomo/issues/31)





# [2.3.0](https://github.com/takomo-io/takomo/compare/v2.2.1...v2.3.0) (2020-07-02)

**Note:** Version bump only for package @takomo/stacks-context





# [2.2.0](https://github.com/takomo-io/takomo/compare/v2.1.0...v2.2.0) (2020-06-26)


### Bug Fixes

* fix handling of stacks in invalid state on the next attempt to create the stacks ([#56](https://github.com/takomo-io/takomo/issues/56)) ([78fbc2f](https://github.com/takomo-io/takomo/commit/78fbc2fb7783aa687ff2cd8257711586d569c7f9)), closes [#54](https://github.com/takomo-io/takomo/issues/54)


### Features

* show changed stack parameters on stack deployment review phase ([#55](https://github.com/takomo-io/takomo/issues/55)) ([8c45809](https://github.com/takomo-io/takomo/commit/8c458090536b9f16b7f1873be94bdcd738264361)), closes [#52](https://github.com/takomo-io/takomo/issues/52)





# [2.1.0](https://github.com/takomo-io/takomo/compare/v2.0.0...v2.1.0) (2020-06-21)

**Note:** Version bump only for package @takomo/stacks-context





# [2.0.0](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.1...v2.0.0) (2020-06-15)

**Note:** Version bump only for package @takomo/stacks-context





# [2.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2020-06-15)

**Note:** Version bump only for package @takomo/stacks-context





# [2.0.0-alpha.0](https://github.com/takomo-io/takomo/compare/v1.3.1...v2.0.0-alpha.0) (2020-06-15)


### Features

* require nodejs version 14.4.0 ([#50](https://github.com/takomo-io/takomo/issues/50)) ([da186b4](https://github.com/takomo-io/takomo/commit/da186b44aadee05fb1478f21a536d0c7b6343553)), closes [#46](https://github.com/takomo-io/takomo/issues/46)


### BREAKING CHANGES

* Takomo now requires nodejs version 14.4.0





# [1.3.0](https://github.com/takomo-io/takomo/compare/v1.2.1...v1.3.0) (2020-06-09)


### Features

* add support to validate parameter resolver configuration ([#41](https://github.com/takomo-io/takomo/issues/41)) ([a70b307](https://github.com/takomo-io/takomo/commit/a70b30798c281a25f002a1a43732fc4afa8cf113)), closes [#40](https://github.com/takomo-io/takomo/issues/40)





## [1.2.1](https://github.com/takomo-io/takomo/compare/v1.2.0...v1.2.1) (2020-05-29)

**Note:** Version bump only for package @takomo/stacks-context





# [1.2.0](https://github.com/takomo-io/takomo/compare/v1.1.0...v1.2.0) (2020-05-28)

**Note:** Version bump only for package @takomo/stacks-context
