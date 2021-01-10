.DEFAULT_GOAL := help
.PHONY: help install build build-if-changed test clean clean-install build-docs sort-package-json dependency-check

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	@yarn

test: ## Run unit tests
	@yarn test

build: ## Build
	@yarn build

build-if-changed: ## Build only changed projects
	@yarn build-if-changed

clean: ## Clean all dependencies and built files
	@yarn clean:all

clean-install: ## Clean all dependencies and built files, then run install
	@yarn clean:all
	@yarn

dependency-check: ## Run dependency check
	@yarn depcheck

sort-package-json: ## Sort package.json files
	@yarn sort-package-json

build-docs: ## Build API docs
	@yarn api-docs