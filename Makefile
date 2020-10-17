.DEFAULT_GOAL := help
.PHONY: help install build test

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	@yarn

test: ## Run unit tests
	@yarn test

build: ## Build
	@yarn build
