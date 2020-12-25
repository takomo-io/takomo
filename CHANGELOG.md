# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.12.1](https://github.com/takomo-io/takomo/compare/v2.12.0...v2.12.1) (2020-12-25)

**Note:** Version bump only for package takomo-project





# [2.12.0](https://github.com/takomo-io/takomo/compare/v2.11.1...v2.12.0) (2020-10-30)


### Features

* add additional file extensions for dynamic stack templates ([#131](https://github.com/takomo-io/takomo/issues/131)) ([3a69873](https://github.com/takomo-io/takomo/commit/3a6987344d4224649b7b8a47530a9282bf53cd8c)), closes [#127](https://github.com/takomo-io/takomo/issues/127)
* expose stack parameters to Handlebars stack template ([#130](https://github.com/takomo-io/takomo/issues/130)) ([7d22f06](https://github.com/takomo-io/takomo/commit/7d22f06559975204ae1b380db0c02f97d2a585cc)), closes [#125](https://github.com/takomo-io/takomo/issues/125)





## [2.11.1](https://github.com/takomo-io/takomo/compare/v2.11.0...v2.11.1) (2020-10-20)


### Bug Fixes

* add NetworkingError to the list of retryable errors ([#124](https://github.com/takomo-io/takomo/issues/124)) ([cc830b4](https://github.com/takomo-io/takomo/commit/cc830b42253cd3d23c91215e2cf5a49ff94f1b74)), closes [#121](https://github.com/takomo-io/takomo/issues/121)
* fix schema validation of resolvers ([#123](https://github.com/takomo-io/takomo/issues/123)) ([c035cc1](https://github.com/takomo-io/takomo/commit/c035cc1c55b92d5112fa566d362140cd2aa70c77)), closes [#122](https://github.com/takomo-io/takomo/issues/122)





# [2.11.0](https://github.com/takomo-io/takomo/compare/v2.10.1...v2.11.0) (2020-10-17)


### Bug Fixes

* fix tests ([69940fa](https://github.com/takomo-io/takomo/commit/69940fa4b012b006d367a19e5e762a75c283fed3))


### Features

* add CLI commands to create and delete account aliases ([#119](https://github.com/takomo-io/takomo/issues/119)) ([56571e4](https://github.com/takomo-io/takomo/commit/56571e45e8e6b52976c5f4323c20e9e3a8280b2f)), closes [#75](https://github.com/takomo-io/takomo/issues/75)





## [2.10.1](https://github.com/takomo-io/takomo/compare/v2.10.0...v2.10.1) (2020-10-13)


### Bug Fixes

* fix a bug in sorting of stacks for deploy and undeploy ([#117](https://github.com/takomo-io/takomo/issues/117)) ([338ef09](https://github.com/takomo-io/takomo/commit/338ef0917f66cf7df1241dd4a8bce418e3acb615)), closes [#110](https://github.com/takomo-io/takomo/issues/110)





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
* validate command path using new configuration tree ([#106](https://github.com/takomo-io/takomo/issues/106)) ([c8d60a8](https://github.com/takomo-io/takomo/commit/c8d60a84c8b357346db6f18a8648d64ec20f2187))





## [2.7.4](https://github.com/takomo-io/takomo/compare/v2.7.3...v2.7.4) (2020-09-27)


### Bug Fixes

* fix sorting of stacks ([#101](https://github.com/takomo-io/takomo/issues/101)) ([f7edc91](https://github.com/takomo-io/takomo/commit/f7edc918c49e04128e960aef816084f939273bfb))





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


### Bug Fixes

* add logic to handle stacks with termination protection enabled on undeploy ([#95](https://github.com/takomo-io/takomo/issues/95)) ([4093189](https://github.com/takomo-io/takomo/commit/409318968058ef9554afe8d23749efe6109446f4)), closes [#87](https://github.com/takomo-io/takomo/issues/87)


### Features

* expose stack object to stack configuration file ([#90](https://github.com/takomo-io/takomo/issues/90)) ([05a6f2b](https://github.com/takomo-io/takomo/commit/05a6f2b769bad3ac5157b9ffe8243a2b6396703f)), closes [#81](https://github.com/takomo-io/takomo/issues/81)
* expose stack object to stack template file ([#94](https://github.com/takomo-io/takomo/issues/94)) ([13c8fd0](https://github.com/takomo-io/takomo/commit/13c8fd09831a668a841abd09df6b011ee258dbff)), closes [#91](https://github.com/takomo-io/takomo/issues/91)
* optimize AWS API calls to minimize throttling ([#93](https://github.com/takomo-io/takomo/issues/93)) ([e05ad1f](https://github.com/takomo-io/takomo/commit/e05ad1ff3fd0902d1509b1feaa51ebb4383fb18b)), closes [#79](https://github.com/takomo-io/takomo/issues/79)





## [2.6.2](https://github.com/takomo-io/takomo/compare/v2.6.1...v2.6.2) (2020-08-27)

**Note:** Version bump only for package takomo-project





## [2.6.1](https://github.com/takomo-io/takomo/compare/v2.6.0...v2.6.1) (2020-08-20)


### Bug Fixes

* adjust throttling of AWS API calls ([da547ef](https://github.com/takomo-io/takomo/commit/da547efd835539ebdabc37e163d492bbf95662ce)), closes [#78](https://github.com/takomo-io/takomo/issues/78)





# [2.6.0](https://github.com/takomo-io/takomo/compare/v2.5.0...v2.6.0) (2020-08-18)


### Features

* expose stack group name, path and path segments as Handlebars variables into stack group config ([#77](https://github.com/takomo-io/takomo/issues/77)) ([c2a7400](https://github.com/takomo-io/takomo/commit/c2a740085ea90c4677a6bca79ae49079812dce2a)), closes [#76](https://github.com/takomo-io/takomo/issues/76)





# [2.5.0](https://github.com/takomo-io/takomo/compare/v2.4.0...v2.5.0) (2020-07-28)


### Features

* add support for AWS backup trusted service for organization management ([#73](https://github.com/takomo-io/takomo/issues/73)) ([7a522eb](https://github.com/takomo-io/takomo/commit/7a522eb5baf6c2ef039fd9211323b1130591372e)), closes [#70](https://github.com/takomo-io/takomo/issues/70)
* add support to enable AI services opt-out policies ([#68](https://github.com/takomo-io/takomo/issues/68)) ([3824246](https://github.com/takomo-io/takomo/commit/3824246d4f9a4c6058cd2edc03185b28173fc076)), closes [#66](https://github.com/takomo-io/takomo/issues/66)
* add support to enable backup policies ([#69](https://github.com/takomo-io/takomo/issues/69)) ([328fdd9](https://github.com/takomo-io/takomo/commit/328fdd9e68cfa32f0043cb269807dc8083db17d7)), closes [#67](https://github.com/takomo-io/takomo/issues/67)
* improve organization deployment ([#72](https://github.com/takomo-io/takomo/issues/72)) ([6104896](https://github.com/takomo-io/takomo/commit/6104896c1b90654ddb0e63de2703a7327d997c85)), closes [#71](https://github.com/takomo-io/takomo/issues/71)





# [2.4.0](https://github.com/takomo-io/takomo/compare/v2.3.0...v2.4.0) (2020-07-07)


### Features

* add CLI commands to bootstrap and tear down deployment targets ([#64](https://github.com/takomo-io/takomo/issues/64)) ([8ddd6d7](https://github.com/takomo-io/takomo/commit/8ddd6d7b7e6c8cd8b8db84badfdf62e1a22bd939)), closes [#63](https://github.com/takomo-io/takomo/issues/63)
* update prompts used to ask input from user ([#62](https://github.com/takomo-io/takomo/issues/62)) ([ff98787](https://github.com/takomo-io/takomo/commit/ff98787f3184246511a55496975321ff33d9598a)), closes [#31](https://github.com/takomo-io/takomo/issues/31)





# [2.3.0](https://github.com/takomo-io/takomo/compare/v2.2.1...v2.3.0) (2020-07-02)


### Features

* add accountId property to deployment targets ([#59](https://github.com/takomo-io/takomo/issues/59)) ([ad0b367](https://github.com/takomo-io/takomo/commit/ad0b367b5d745e2b869ea907bd46ccf6247220aa)), closes [#58](https://github.com/takomo-io/takomo/issues/58)
* improve error handling when parsing yaml files ([#60](https://github.com/takomo-io/takomo/issues/60)) ([2a35bda](https://github.com/takomo-io/takomo/commit/2a35bda327e3ff18aa62712eb5144431f7b9e7c7)), closes [#57](https://github.com/takomo-io/takomo/issues/57)





## [2.2.1](https://github.com/takomo-io/takomo/compare/v2.2.0...v2.2.1) (2020-07-01)


### Bug Fixes

* fix invalid version range used to check current node.js version ([bcb54b4](https://github.com/takomo-io/takomo/commit/bcb54b46359243a9d18f43a4800908344ff8a09b))





# [2.2.0](https://github.com/takomo-io/takomo/compare/v2.1.0...v2.2.0) (2020-06-26)


### Bug Fixes

* fix handling of stacks in invalid state on the next attempt to create the stacks ([#56](https://github.com/takomo-io/takomo/issues/56)) ([78fbc2f](https://github.com/takomo-io/takomo/commit/78fbc2fb7783aa687ff2cd8257711586d569c7f9)), closes [#54](https://github.com/takomo-io/takomo/issues/54)


### Features

* show changed stack parameters on stack deployment review phase ([#55](https://github.com/takomo-io/takomo/issues/55)) ([8c45809](https://github.com/takomo-io/takomo/commit/8c458090536b9f16b7f1873be94bdcd738264361)), closes [#52](https://github.com/takomo-io/takomo/issues/52)





# [2.1.0](https://github.com/takomo-io/takomo/compare/v2.0.0...v2.1.0) (2020-06-21)


### Features

* add projectDir property to config sets ([#51](https://github.com/takomo-io/takomo/issues/51)) ([263bd17](https://github.com/takomo-io/takomo/commit/263bd175ae7748793953712da28a5d0bac7e25f0)), closes [#24](https://github.com/takomo-io/takomo/issues/24)





# [2.0.0](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.1...v2.0.0) (2020-06-15)

**Note:** Version bump only for package takomo-project





# [2.0.0-alpha.1](https://github.com/takomo-io/takomo/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2020-06-15)

**Note:** Version bump only for package takomo-project





# [2.0.0-alpha.0](https://github.com/takomo-io/takomo/compare/v1.3.1...v2.0.0-alpha.0) (2020-06-15)


### Features

* require nodejs version 14.4.0 ([#50](https://github.com/takomo-io/takomo/issues/50)) ([da186b4](https://github.com/takomo-io/takomo/commit/da186b44aadee05fb1478f21a536d0c7b6343553)), closes [#46](https://github.com/takomo-io/takomo/issues/46)


### BREAKING CHANGES

* Takomo now requires nodejs version 14.4.0





## [1.3.1](https://github.com/takomo-io/takomo/compare/v1.3.0...v1.3.1) (2020-06-14)


### Bug Fixes

* add missing quotation to master account id in organization config file that is created along wi ([#49](https://github.com/takomo-io/takomo/issues/49)) ([df1e115](https://github.com/takomo-io/takomo/commit/df1e115928e90b64c931f6ff846b8f73d3efb5bd)), closes [#48](https://github.com/takomo-io/takomo/issues/48)
* fix bug in parsing organization config's organizational units ([#47](https://github.com/takomo-io/takomo/issues/47)) ([2b9ccf2](https://github.com/takomo-io/takomo/commit/2b9ccf2656b81d2d707cd401ce043804e94cef2e)), closes [#45](https://github.com/takomo-io/takomo/issues/45)





# [1.3.0](https://github.com/takomo-io/takomo/compare/v1.2.1...v1.3.0) (2020-06-09)


### Bug Fixes

* fix information shown to confirm creation of a new account ([#44](https://github.com/takomo-io/takomo/issues/44)) ([7a82c66](https://github.com/takomo-io/takomo/commit/7a82c669e83d3b40dd9dfd54d4172fb8363c49b3)), closes [#42](https://github.com/takomo-io/takomo/issues/42)


### Features

* add cli command to initialize a new project ([#43](https://github.com/takomo-io/takomo/issues/43)) ([7a11d55](https://github.com/takomo-io/takomo/commit/7a11d55b6e19fd46e59d614b514abe1cef2a66c3))
* add support to validate parameter resolver configuration ([#41](https://github.com/takomo-io/takomo/issues/41)) ([a70b307](https://github.com/takomo-io/takomo/commit/a70b30798c281a25f002a1a43732fc4afa8cf113)), closes [#40](https://github.com/takomo-io/takomo/issues/40)





## [1.2.1](https://github.com/takomo-io/takomo/compare/v1.2.0...v1.2.1) (2020-05-29)

**Note:** Version bump only for package takomo-project





# [1.2.0](https://github.com/takomo-io/takomo/compare/v1.1.0...v1.2.0) (2020-05-28)


### Features

* improve Handlebars error messages ([#33](https://github.com/takomo-io/takomo/issues/33)) ([875c586](https://github.com/takomo-io/takomo/commit/875c58647e925350dce58052e1f0d93c68152ad4)), closes [#32](https://github.com/takomo-io/takomo/issues/32)
* include information about OS and versions in error messages ([#37](https://github.com/takomo-io/takomo/issues/37)) ([4364be8](https://github.com/takomo-io/takomo/commit/4364be884e66ebce40099b22f6fe6a343e4c7595)), closes [#36](https://github.com/takomo-io/takomo/issues/36)





# [1.1.0](https://github.com/takomo-io/takomo/compare/v1.0.0...v1.1.0) (2020-05-18)


### Bug Fixes

* convert variables of type Map to objects when exposing them in Handlebars templates ([#28](https://github.com/takomo-io/takomo/issues/28)) ([1fdeae4](https://github.com/takomo-io/takomo/commit/1fdeae46faa5b6296c4daf1ef31b46fa8b0dfc68)), closes [#27](https://github.com/takomo-io/takomo/issues/27)


### Features

* create a minimal organization configuration file when a new organization is created ([#22](https://github.com/takomo-io/takomo/issues/22)) ([c07c0c8](https://github.com/takomo-io/takomo/commit/c07c0c8eb70eeabcb2eb453893cb1d568dd755f2)), closes [#21](https://github.com/takomo-io/takomo/issues/21)
* show required minimum IAM policy in command specific help ([#26](https://github.com/takomo-io/takomo/issues/26)) ([177cf3f](https://github.com/takomo-io/takomo/commit/177cf3fba016b33e8009cb62e6f715ddc25dc4b9)), closes [#23](https://github.com/takomo-io/takomo/issues/23)





# [1.0.0](https://github.com/takomo-io/takomo/compare/v0.2.0...v1.0.0) (2020-05-12)


### Features

* change timeout to use seconds instead of minutes ([#16](https://github.com/takomo-io/takomo/issues/16)) ([7419103](https://github.com/takomo-io/takomo/commit/74191036e27d31ef9f4cd23dd908c9e737217204)), closes [#15](https://github.com/takomo-io/takomo/issues/15)
* hook enhancements ([#11](https://github.com/takomo-io/takomo/issues/11)) ([0132e77](https://github.com/takomo-io/takomo/commit/0132e77d87be7e4961b8e489e23a6c27f842f13d)), closes [#9](https://github.com/takomo-io/takomo/issues/9)
* load existing stacks before proceeding to deploy/undeploy ([#20](https://github.com/takomo-io/takomo/issues/20)) ([082bf26](https://github.com/takomo-io/takomo/commit/082bf263830eb2996b62331c565b4fae2b9a1770)), closes [#19](https://github.com/takomo-io/takomo/issues/19)
* parameter resolver enhancements ([#12](https://github.com/takomo-io/takomo/issues/12)) ([a54d2d0](https://github.com/takomo-io/takomo/commit/a54d2d05c93a17364cc61d0606a8d9dc62aa8187)), closes [#10](https://github.com/takomo-io/takomo/issues/10)
* remove command hook 'register' property ([#18](https://github.com/takomo-io/takomo/issues/18)) ([7eb60a9](https://github.com/takomo-io/takomo/commit/7eb60a9cde1ded7cc16a83563c074149e58dba2a)), closes [#17](https://github.com/takomo-io/takomo/issues/17)
* rename organization launch CLI command ([#14](https://github.com/takomo-io/takomo/issues/14)) ([e4c9572](https://github.com/takomo-io/takomo/commit/e4c95720427e53d4e44d605d507569523d85e581)), closes [#13](https://github.com/takomo-io/takomo/issues/13)


### BREAKING CHANGES

* register property removed
* Timeout is now configured in seconds instead of minutes
* Rename 'tkm org launch' CLI command to 'tkm org deploy'
* Parameter resolver API and custom resolver configuration file have changed
* Hook output structure has changed.





# [0.2.0](https://github.com/takomo-io/takomo/compare/v0.1.0...v0.2.0) (2020-05-07)


### Bug Fixes

* correct ordering of stack events during stack deploy/undeploy operations ([cc7dd4f](https://github.com/takomo-io/takomo/commit/cc7dd4f2ec3b8708d31d5e80574bdc7750d01818)), closes [#7](https://github.com/takomo-io/takomo/issues/7)


### Features

* add new trusted aws services ([#6](https://github.com/takomo-io/takomo/issues/6)) ([5c224d3](https://github.com/takomo-io/takomo/commit/5c224d3e92b6d0ea1c426a3ba87af44f2aa80652)), closes [#5](https://github.com/takomo-io/takomo/issues/5)





# [0.1.0](https://github.com/takomo-io/takomo/compare/v0.0.2...v0.1.0) (2020-05-06)


### Bug Fixes

* fix loading of required version from Takomo project configuration file ([ff94c01](https://github.com/takomo-io/takomo/commit/ff94c0137aea4ecc05d6a0ccdbb1701865daef4f)), closes [#3](https://github.com/takomo-io/takomo/issues/3)


### Features

* add support for new regions: Milan and Capetown ([#2](https://github.com/takomo-io/takomo/issues/2)) ([5209694](https://github.com/takomo-io/takomo/commit/5209694196117e8c7e0e660491ef9d8a1dad3d46)), closes [#1](https://github.com/takomo-io/takomo/issues/1)





## 0.0.2 (2020-05-04)

**Note:** Version bump only for package takomo-project
