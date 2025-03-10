DIR=$(shell pwd)
HDS_PORT := 8085

.PHONY: help

install-docker: ## Install docker and docker compose
	${DIR}/scripts/install_docker.sh

install-node: ## Install node and npm
	${DIR}/scripts/install_node.sh

run-newman: ## Run Integration Test with Newman
	${DIR}/scripts/newman.sh

build-dev: ## Build local server in docker compose
	sudo docker compose up -d --build

build-image: ## Build local image
	sudo docker compose build

build-backend: ## Build backend for CI.
	export HDS_PORT=${HDS_PORT}
	sudo docker compose -f docker-compose.base.yml up -d --build

build-monitor: ## Build monitor service
	${DIR}/supervisor/monitor/build.sh

migrate-dev: ## Migrate database in local compose server
	sudo docker compose exec web python hds/manage.py migrate

load-fixtures: ## Load fixtures in local compose server
	sudo docker compose exec web python hds/manage.py loaddata fixtures/*

server: build-monitor build-dev migrate-dev load-fixtures  ## Build, Migrate, Load

ci: build-monitor install-docker build-backend migrate-dev load-fixtures ## Create environment for integration testing the API in CI

local-ci: build-monitor install-docker build-backend migrate-dev load-fixtures install-node run-newman ## Run local CI Integration Testing

clean-server: ## Tear down containers
	sudo docker compose down -v --remove-orphans

clean-ci:
	sudo docker compose -f docker-compose.base.yml down -v --remove-orphans

help:
	@echo Use these commands for setting up docker environment outside of python virtual environment
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
