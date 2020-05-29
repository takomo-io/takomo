# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
