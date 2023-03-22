DIR=$(shell pwd)
HDS_PORT := 8085

.PHONY: help

install-docker: ## Install docker and docker compose
	${DIR}/scripts/install_docker.sh

build-dev: ## Build local server in docker compose
	docker compose up -d --build

migrate-dev: ## Migrate database in local compose server
	docker compose exec web python hds/manage.py migrate

load-fixtures: ## Load fixtures in local compose server
	@echo Wait for migrations
	sleep 10
	docker compose exec web python hds/manage.py loaddata fixtures/*

server: install-docker build-dev migrate-dev load-fixtures  ## Build, Migrate, Load

clean: ## Tear down containers
	docker compose down --remove-orphans

help:
	@echo Use these commands for setting up docker environment outside of python virtual environment
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
