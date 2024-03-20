DIR=$(shell pwd)
HDS_PORT := 8085

.PHONY: help

install-docker: ## Install docker and docker compose
	${DIR}/scripts/install_docker.sh

build-dev: ## Build local server in docker compose
	sudo docker compose up -d --build

build-backend: ## Build backend for CI.
	export HDS_PORT=${HDS_PORT}
	sudo docker compose -f docker-compose.base.yml up -d --build

migrate-dev: ## Migrate database in local compose server
	sudo docker compose exec web python hds/manage.py migrate

load-fixtures: ## Load fixtures in local compose server
	sudo docker compose exec web python hds/manage.py loaddata fixtures/*

server: build-dev migrate-dev load-fixtures  ## Build, Migrate, Load

ci: install-docker build-backend migrate-dev load-fixtures ## Create environment for integration testing the API in CI

clean-server: ## Tear down containers
	sudo docker compose down -v --remove-orphans

clean-ci:
	sudo docker compose -f docker-compose.base.yml down -v --remove-orphans

help:
	@echo Use these commands for setting up docker environment outside of python virtual environment
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
