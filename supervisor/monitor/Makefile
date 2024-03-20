DIR=$(shell pwd)

help:
	@echo Use these commands for setting up docker environment outside of python virtual environment
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

setup: ## Setup the environment
	${DIR}/setup.sh

build: ## Build the environment
	${DIR}/build.sh

all: setup build ## Setup and build the environment
