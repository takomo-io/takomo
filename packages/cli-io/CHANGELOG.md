# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.4.2](https://github.com/takomo-io/takomo/compare/v3.4.1...v3.4.2) (2021-03-18)


### Bug Fixes

* **review:** fix reviewing of stack tags ([#175](https://github.com/takomo-io/takomo/issues/175)) ([6df265f](https://github.com/takomo-io/takomo/commit/6df265f7f4810f7d3125497d50e32892e7323d3e)), closes [#174](https://github.com/takomo-io/takomo/issues/174)





## [3.4.1](https://github.com/takomo-io/takomo/compare/v3.4.0...v3.4.1) (2021-03-17)


### Bug Fixes

* fix reviewing of stack parameters ([#171](https://github.com/takomo-io/takomo/issues/171)) ([d16c6c7](https://github.com/takomo-io/takomo/commit/d16c6c79cdc85723dc8f8a3929e35ea8fd4362de)), closes [#170](https://github.com/takomo-io/takomo/issues/170)





# [3.4.0](https://github.com/takomo-io/takomo/compare/v3.3.0...v3.4.0) (2021-03-08)


### Bug Fixes

* correct output of termination protection ([79eb950](https://github.com/takomo-io/takomo/commit/79eb950f819bd1dcce55d08222586c40ae9766dc))





# [3.3.0](https://github.com/takomo-io/takomo/compare/v3.2.2...v3.3.0) (2021-02-22)


### Features

* improve stack template diff output ([4d387e1](https://github.com/takomo-io/takomo/commit/4d387e105b0c8a7e3eebe15a6807b7e7365812c6)), closes [#161](https://github.com/takomo-io/takomo/issues/161)





## [3.2.2](https://github.com/takomo-io/takomo/compare/v3.2.1...v3.2.2) (2021-02-20)

**Note:** Version bump only for package @takomo/cli-io





## [3.2.1](https://github.com/takomo-io/takomo/compare/v3.2.0...v3.2.1) (2021-02-18)

**Note:** Version bump only for package @takomo/cli-io





# [3.2.0](https://github.com/takomo-io/takomo/compare/v3.1.0...v3.2.0) (2021-02-16)

**Note:** Version bump only for package @takomo/cli-io





# [3.1.0](https://github.com/takomo-io/takomo/compare/v3.0.1...v3.1.0) (2021-02-14)


### Bug Fixes

* fix imports ([a7df59b](https://github.com/takomo-io/takomo/commit/a7df59b88690b2fcb844bf177014b55b0e0745e3))


### Features

* add option to specify organizational unit to create account command ([#144](https://github.com/takomo-io/takomo/issues/144)) ([fe543f0](https://github.com/takomo-io/takomo/commit/fe543f0491cbbd69f26bc695a8b4e40126d8df1d)), closes [#143](https://github.com/takomo-io/takomo/issues/143)
* implement loading of accounts from external repository ([#142](https://github.com/takomo-io/takomo/issues/142)) ([953250e](https://github.com/takomo-io/takomo/commit/953250e57b6f0c3349cf94d2636619f9521682c4)), closes [#140](https://github.com/takomo-io/takomo/issues/140)
* persist created accounts using account repository ([#146](https://github.com/takomo-io/takomo/issues/146)) ([69a0231](https://github.com/takomo-io/takomo/commit/69a02312d6ed4da64a7cf6d45d4f62b883afa791)), closes [#141](https://github.com/takomo-io/takomo/issues/141)





## [3.0.1](https://github.com/takomo-io/takomo/compare/v3.0.0...v3.0.1) (2021-01-31)

**Note:** Version bump only for package @takomo/cli-io





# [3.0.0](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.5...v3.0.0) (2021-01-23)

**Note:** Version bump only for package @takomo/cli-io





# [3.0.0-alpha.5](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2021-01-20)


### Bug Fixes

* fix handling of parameters with default values, change set review details ([9ba7012](https://github.com/takomo-io/takomo/commit/9ba70127a6940fec649f922161a280c7965f71e6))





# [3.0.0-alpha.4](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2021-01-18)


### Bug Fixes

* fix inheritance of tags ([edfd5e7](https://github.com/takomo-io/takomo/commit/edfd5e75b1b3221fe4c0ffe4f7f1a882aec0c0c6))


### Features

* add option to disabled dynamic template processing ([efa59aa](https://github.com/takomo-io/takomo/commit/efa59aa9ad13226b284faf5a6c080c02d966079a))





# [3.0.0-alpha.2](https://github.com/takomo-io/takomo/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2021-01-17)


### Features

* improve organization commands ([ebfabc1](https://github.com/takomo-io/takomo/commit/ebfabc15d5baf39b85b49140b379d779ee15b9f5))
* improve organization commands error handling ([691512c](https://github.com/takomo-io/takomo/commit/691512c174253db0ab18cb0ffd5915574be798ff))





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

**Note:** Version bump only for package @takomo/cli-io





# [2.12.0](https://github.com/takomo-io/takomo/compare/v2.11.1...v2.12.0) (2020-10-30)

**Note:** Version bump only for package @takomo/cli-io





## [2.11.1](https://github.com/takomo-io/takomo/compare/v2.11.0...v2.11.1) (2020-10-20)

**Note:** Version bump only for package @takomo/cli-io





# [2.11.0](https://github.com/takomo-io/takomo/compare/v2.10.1...v2.11.0) (2020-10-17)


### Bug Fixes

* fix tests ([69940fa](https://github.com/takomo-io/takomo/commit/69940fa4b012b006d367a19e5e762a75c283fed3))


### Features

* add CLI commands to create and delete account aliases ([#119](https://github.com/takomo-io/takomo/issues/119)) ([56571e4](https://github.com/takomo-io/takomo/commit/56571e45e8e6b52976c5f4323c20e9e3a8280b2f)), closes [#75](https://github.com/takomo-io/takomo/issues/75)





## [2.10.1](https://github.com/takomo-io/takomo/compare/v2.10.0...v2.10.1) (2020-10-13)

**Note:** Version bump only for package @takomo/cli-io





# [2.10.0](https://github.com/takomo-io/takomo/compare/v2.9.0...v2.10.0) (2020-10-11)


### Features

* add CLI command to show stacks dependency graph ([#116](https://github.com/takomo-io/takomo/issues/116)) ([20c00f2](https://github.com/takomo-io/takomo/commit/20c00f2a7f71c62f514fea72d24c6be9c1218b42)), closes [#115](https://github.com/takomo-io/takomo/issues/115)





# [2.9.0](https://github.com/takomo-io/takomo/compare/v2.8.0...v2.9.0) (2020-10-09)

**Note:** Version bump only for package @takomo/cli-io





# [2.8.0](https://github.com/takomo-io/takomo/compare/v2.7.4...v2.8.0) (2020-10-05)

**Note:** Version bump only for package @takomo/cli-io





## [2.7.4](https://github.com/takomo-io/takomo/compare/v2.7.3...v2.7.4) (2020-09-27)

**Note:** Version bump only for package @takomo/cli-io





## [2.7.3](https://github.com/takomo-io/takomo/compare/v2.7.2...v2.7.3) (2020-09-21)

**Note:** Version bump only for package @takomo/cli-io





## [2.7.2](https://github.com/takomo-io/takomo/compare/v2.7.1...v2.7.2) (2020-09-07)

**Note:** Version bump only for package @takomo/cli-io





## [2.7.1](https://github.com/takomo-io/takomo/compare/v2.7.0...v2.7.1) (2020-09-02)


### Bug Fixes

* fix handling of failed change set creation ([#97](https://github.com/takomo-io/takomo/issues/97)) ([a81d514](https://github.com/takomo-io/takomo/commit/a81d5148c154044cebdc33eaf42fb87adfbe4074)), closes [#96](https://github.com/takomo-io/takomo/issues/96)





# [2.7.0](https://github.com/takomo-io/takomo/compare/v2.6.2...v2.7.0) (2020-08-31)

**Note:** Version bump only for package @takomo/cli-io





## [2.6.2](https://github.com/takomo-io/takomo/compare/v2.6.1...v2.6.2) (2020-08-27)

**Note:** Version bump only for package @takomo/cli-io





## [2.6.1](https://github.com/takomo-io/takomo/compare/v2.6.0...v2.6.1) (2020-08-20)

**Note:** Version bump only for package @takomo/cli-io





# [2.6.0](https://github.com/takomo-io/takomo/compare/v2.5.0...v2.6.0) (2020-08-18)

**Note:** Version bump only for package @takomo/cli-io





# [2.5.0](https://github.com/takomo-io/takomo/compare/v2.4.0...v2.5.0) (2020-07-28)


### Features

* improve organization deployment ([#72](https://github.com/takomo-io/takomo/issues/72)) ([6104896](https://github.com/takomo-io/takomo/commit/6104896c1b90654ddb0e63de2703a7327d997c85)), closes [#71](https://github.com/takomo-io/takomo/issues/71)





# [2.4.0](https://github.com/takomo-io/takomo/compare/v2.3.0...v2.4.0) (2020-07-07)


### Features

* add CLI commands to bootstrap and tear down deployment targets ([#64](https://github.com/takomo-io/takomo/issues/64)) ([8ddd6d7](https://github.com/takomo-io/takomo/commit/8ddd6d7b7e6c8cd8b8db84badfdf62e1a22bd939)), closes [#63](https://github.com/takomo-io/takomo/issues/63)
* update prompts used to ask input from user ([#62](https://github.com/takomo-io/takomo/issues/62)) ([ff98787](https://github.com/takomo-io/takomo/commit/ff98787f3184246511a55496975321ff33d9598a)), closes [#31](https://github.com/takomo-io/takomo/issues/31)





# [2.3.0](https://github.com/takomo-io/takomo/compare/v2.2.1...v2.3.0) (2020-07-02)


### Features

* add accountId property to deployment targets ([#59](https://github.com/takomo-io/takomo/issues/59)) ([ad0b367](https://github.com/takomo-io/takomo/commit/ad0b367b5d745e2b869ea907bd46ccf6247220aa)), closes [#58](https://github.com/takomo-io/takomo/issues/58)





# [2.2.0](https://github.com/takomo-io/takomo/compare/v2.1.0...v2.2.0) (2020-06-26)


### Features

* show changed stack parameters on stack deployment review phase ([#55](https://github.com/takomo-io/takomo/issues/55)) ([8c45809](https://github.com/takomo-io/takomo/commit/8c458090536b9f16b7f1873be94bdcd738264361)), closes [#52](https://github.com/takomo-io/takomo/issues/52)





# [2.1.0](https://github.com/takomo-io/takomo/compare/v2.0.0...v2.1.0) (2020-06-21)

**Note:** Version bump only for package @takomo/cli-io





# [2.0.0](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.1...v2.0.0) (2020-06-15)

**Note:** Version bump only for package @takomo/cli-io





# [2.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2020-06-15)

**Note:** Version bump only for package @takomo/cli-io





# [2.0.0-alpha.0](https://github.com/takomo-io/takomo/compare/v1.3.1...v2.0.0-alpha.0) (2020-06-15)


### Features

* require nodejs version 14.4.0 ([#50](https://github.com/takomo-io/takomo/issues/50)) ([da186b4](https://github.com/takomo-io/takomo/commit/da186b44aadee05fb1478f21a536d0c7b6343553)), closes [#46](https://github.com/takomo-io/takomo/issues/46)


### BREAKING CHANGES

* Takomo now requires nodejs version 14.4.0





## [1.3.1](https://github.com/takomo-io/takomo/compare/v1.3.0...v1.3.1) (2020-06-14)

**Note:** Version bump only for package @takomo/cli-io





# [1.3.0](https://github.com/takomo-io/takomo/compare/v1.2.1...v1.3.0) (2020-06-09)


### Features

* add cli command to initialize a new project ([#43](https://github.com/takomo-io/takomo/issues/43)) ([7a11d55](https://github.com/takomo-io/takomo/commit/7a11d55b6e19fd46e59d614b514abe1cef2a66c3))





## [1.2.1](https://github.com/takomo-io/takomo/compare/v1.2.0...v1.2.1) (2020-05-29)

**Note:** Version bump only for package @takomo/cli-io





# [1.2.0](https://github.com/takomo-io/takomo/compare/v1.1.0...v1.2.0) (2020-05-28)

**Note:** Version bump only for package @takomo/cli-io





# [1.1.0](https://github.com/takomo-io/takomo/compare/v1.0.0...v1.1.0) (2020-05-18)


### Features

* create a minimal organization configuration file when a new organization is created ([#22](https://github.com/takomo-io/takomo/issues/22)) ([c07c0c8](https://github.com/takomo-io/takomo/commit/c07c0c8eb70eeabcb2eb453893cb1d568dd755f2)), closes [#21](https://github.com/takomo-io/takomo/issues/21)





# [1.0.0](https://github.com/takomo-io/takomo/compare/v0.2.0...v1.0.0) (2020-05-12)


### Features

* load existing stacks before proceeding to deploy/undeploy ([#20](https://github.com/takomo-io/takomo/issues/20)) ([082bf26](https://github.com/takomo-io/takomo/commit/082bf263830eb2996b62331c565b4fae2b9a1770)), closes [#19](https://github.com/takomo-io/takomo/issues/19)
* parameter resolver enhancements ([#12](https://github.com/takomo-io/takomo/issues/12)) ([a54d2d0](https://github.com/takomo-io/takomo/commit/a54d2d05c93a17364cc61d0606a8d9dc62aa8187)), closes [#10](https://github.com/takomo-io/takomo/issues/10)
* rename organization launch CLI command ([#14](https://github.com/takomo-io/takomo/issues/14)) ([e4c9572](https://github.com/takomo-io/takomo/commit/e4c95720427e53d4e44d605d507569523d85e581)), closes [#13](https://github.com/takomo-io/takomo/issues/13)


### BREAKING CHANGES

* Rename 'tkm org launch' CLI command to 'tkm org deploy'
* Parameter resolver API and custom resolver configuration file have changed





# [0.2.0](https://github.com/takomo-io/takomo/compare/v0.1.0...v0.2.0) (2020-05-07)

**Note:** Version bump only for package @takomo/cli-io





# [0.1.0](https://github.com/takomo-io/takomo/compare/v0.0.2...v0.1.0) (2020-05-06)

**Note:** Version bump only for package @takomo/cli-io





## 0.0.2 (2020-05-04)

**Note:** Version bump only for package @takomo/cli-io
