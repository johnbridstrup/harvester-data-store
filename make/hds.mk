.PHONY: all clean jenkins
all: clean login build push
jenkins: clean login-no-profile build-jenkins push-jenkins

SHA = $(shell git rev-parse --short HEAD)
AWS_REGION = us-west-1
AWS_PROFILE = aft-prod
_AFT_DEPLOY_TAG ?= $(SHA)

login:
	aws ecr get-login-password --region $(AWS_REGION) --profile $(AWS_PROFILE) | docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

login-no-profile:
	aws ecr get-login-password --region $(AWS_REGION) | sudo docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

build:
	docker build -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/hds:api-$(_AFT_DEPLOY_TAG) ../..

build-jenkins:
	sudo docker build -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/hds:api-$(_AFT_DEPLOY_TAG) ../..

push:
	docker push $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/hds:api-$(_AFT_DEPLOY_TAG)

push-jenkins:
	sudo docker push $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/hds:api-$(_AFT_DEPLOY_TAG)

clean:
	-rm -f $(HDS_ROOT)/hds/.sqstoken; 
	-rm $(HDS_ROOT)/hds/db.sqlite3; 
	-rm -rf $(HDS_ROOT)/hds/media/extracts/*;
	-rm -rf $(HDS_ROOT)/hds/media/uploads/*;
	-rm -rf $(HDS_ROOT)/hds/uploads/*;
	-find $(HDS_ROOT) -type f -name 'dump.rdb' -delete
