.PHONY: all
all: build push

SHA = $(shell git rev-parse --short HEAD)
AWS_REGION = us-west-1
NAME = hds-beatbox
PUSH_PROFILE = $(AWS_PROFILE)
BUILD_PROFILE = aft-prod
BUILD_ACC_ID = 838860823423

build:
	aws ecr get-login-password --region $(AWS_REGION) --profile $(BUILD_PROFILE) | docker login --username AWS --password-stdin $(BUILD_ACC_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
	docker build -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/hds:$(NAME)-$(SHA) ../..

push:
	aws ecr get-login-password --region $(AWS_REGION) --profile $(PUSH_PROFILE) | docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
	docker push $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/hds:$(NAME)-$(SHA)
