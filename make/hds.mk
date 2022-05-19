.PHONY: all
all: login build push

SHA = $(shell git rev-parse --short HEAD)
AWS_REGION = us-west-1
NAME = hds-staging

login:
	aws ecr get-login-password --region $(AWS_REGION) --profile $(AWS_PROFILE) | docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

build:
	docker build -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/hds:$(NAME)-$(SHA) ../..

push:
	docker push $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/hds:$(NAME)-$(SHA)
