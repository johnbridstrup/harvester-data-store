# Harveseter Data Store

The central hub for all AFT Harvester data.

### Primary Uses
- Ingesting complex data from harvesters (Anything more than simple prometheus metrics).
- Retrieving data from the cloud for consumption by client tools or the HDS frontent.

### HDS Stack
- [Django](https://www.djangoproject.com/)
- [Django Rest Framework](https://www.django-rest-framework.org/)
- [Celery](https://docs.celeryq.dev/en/stable/getting-started/introduction.html)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)
- [React](https://reactjs.org/)
- AWS (via [Terraform](https://www.terraform.io/))
  - SQS
  - S3
  - ECS Fargate

## Sub-READMEs
* [beatbox](beatbox/README.md) (Continuous integration in the cloud)

## Bootstrapping
Clone the repo, `cd` in and run `./setup-venv.sh`. This script will create a `venv` and 
install python requirements, `Docker` and `Docker Compose`. Enter the development environment with `source start.sh`.
This will activate the venv, define some useful aliases and create the `.env` file. 
To see what aliases are defined, run `HELP` in your terminal.

Some environment variables will be set automatically. `HDS_PORT` is set by being passed directly to to the start script `source start.sh XXXX`, sourced from your local environment,
set to the default `8085` or chosen randomly from open ports on the system, in that order of priority. It can be changed at
any time by running `setport XXXX` or `./set_port.sh XXXX` from the project root.

These scripts are only verified in Ubuntu 20.04 but should run in other versions. On other 
operating systems or linux distributions, you may have to install the dependencies manually.

To run the frontend, you will also need to run `scripts/install-node.sh`.


## Running the development server
The development server is created via `docker compose`, which should have installed when running the setup scripts. You can build the development server with the alias `runserver`. This will pull and create all of the necessary containers, which are defined in `docker-compose.yml`, and spin them all up. Logs for the various services defined in `docker-compose.yml` (eg. `web`, `db`, etc..) can be accessed by running `docker compose logs <service>`. For convenience, the alias `hds-logs` will display the logs from HDS services. You can tear down the server with `stopserver` or `docker compose down --remove-orphans(optional)`. 

It is also possible to run the server outside of docker (you must have `redis-server` installed to do this). To do that, run these commands from the `hds` folder in separate terminals:
1. `redis-server`
2. `python manage.py migrate && python manage.py loaddata ../fixtures/* && python manage.py runserver ${HDS_PORT}`
3. `celery -A hds worker -l INFO`

and from the `frontend/` folder run `npm start`. Logs for each service will be dumped in their respective terminals. 

Interactions and changes to the database will be lost when rebuilding with `docker compose` but will persist when building manually. 


## Creating a new Django app
We approach creating new Django apps in the conventional way. [See their documentation](https://docs.djangoproject.com/en/4.1/intro/tutorial01/), which is very good, for help along the way. The general process for creating new apps in HDS and utilizing the Rest Framework is (from the `hds` folder):
- `python manage.py startapp yourapp`,
- Define models, register app in `settings.py` and create migrations,
- Write serializers in `yourapp/serializers.py` or `yourapp/serializers/YourModelSerializer.py`,
- Write views in `yourapp/views.py` or `yourapp/views/yourmodelview.py`,
- Setup the urls.


### Creating a report
Data uploaded from harvesters will generally come in the form of a `JSON` report. These reports will be uploaded with some consistency in their structure and top level contents, see [our formatter](https://github.com/AdvancedFarm/aft-py-packages/blob/master/aft-core/src/aft_core/tools/uploader_utils.py#L45) and [error reports](https://github.com/AdvancedFarm/aft-py-packages/blob/master/aft-py-sb-harv/src/aft_py_sb_harv/harvester.py#L1154) for examples.
Most of this can be handled with our abstract classes which are located in the `common` app.
- New report models should inherit the `EventModelMixin` and `ReportBase` abstract models.
  - These give the model certain fields and methods and allow linking reports and files asynchronously via `UUID`.
- New report serializers should inherit `EventSerializerMixin` and `ReportSerializerBase`.
- New report `ModelViewset` should inherit from `ReportModelViewset`.


### Creating other models
The process for creating other models and APIs is largely the same. Models should inherit `CommonInfo`, and viewsets should inherit `CreateModelViewset`. Serializers use the DRF `serializers.ModelSerializer` and the `EventModelMixin` and `EventSerializerMixin` are optional. An example of using events for non-reports is the `S3File` app and an example without events is the `harvdeploy.models.HarvesterCodeRelease` model.



## Getting your new data or report from a harvester to HDS
Harvesters will use the [aft-iot-uploader](https://github.com/AdvancedFarm/packages/tree/master/aft-iot-uploader) package to get data from a harvester into S3. We then use Amazon `SQS` to get it to HDS. There are three major steps to accomplishing this once your API is written.
### 1. Create a new `SQS` queue
  - Add it's name to the `queue_names` list in `terraform/(dev,prod)/backend/hds_backend.tf`.
  - Add a variable for this queue in `terraform/module/hds/variables.tf`
  ```
  variable "jobresults_queue_url" {
    description = "URL for jobresults queue"
    type        = string
  }
  ```
  - Add the queue url to the `environment_variables` in `terraform/module/hds/ecs_service.tf`. The name before `_QUEUE_URL` should match the endpoint that it will eventually be sent to.
  ```
    { "name" : "ERRORREPORTS_QUEUE_URL", "value" : var.errorreport_queue_url },
    { "name" : "S3FILES_QUEUE_URL", "value" : var.s3files_queue_url },
    { "name" : "SESSCLIP_QUEUE_URL", "value" : var.sessclip_queue_url },
    { "name" : "HARVVERSION_QUEUE_URL", "value" : var.versions_queue_url },
    { "name" : "JOBRESULTS_QUEUE_URL", "value" : var.jobresults_queue_url },
  ```
  - Get the data object in `terraform/(dev,prod)/hds/init.tf`/
  ```
  data "aws_sqs_queue" "jobresults_queue" {
    name = local.jobresults_queue_name
  }
  ```
  - Pass the queue url through to the `hds` module in `terraform/(dev,prod)/hds/hds.tf`
  ```
  errorreport_queue_url    = data.aws_sqs_queue.errorreport_queue.url
  ```
### 2. Create a new SQS client
We use `supervisord` to manage multiple running processes within the container. At the moment, we run an additional SQS client per possible report or incoming data type. To add a new client, add this process to `supervisor/supervisord.conf`. The first argument should match the value you used in `1` for the queue url and should be the api endpoint. The example below fetches from the error report queue and forwards to the `/api/v1/errorreports/` endpoint.
```
[program:report_sqs]
command=/opt/app/scripts/start_s3_client.sh ERRORREPORTS 9104
user=root
stdout_logfile=/dev/stdout      ; stdout log path, NONE for none; default AUTO
redirect_stderr=true
stdout_logfile_maxbytes=0
```

The client will download the report contents and `POST` them to hds. If you just want the event message sent to hds, use `scripts/start_event_client.sh`. The second argument to the script is the prometheus metrics port. This value should be added to `terraform/(dev,prod)/hds/hds.tf` `sqs_client_metrics_ports` local variable. Choose a unique value for the port.

### 3. Create the S3 event
In the [infrastructure](https://github.com/AdvancedFarm/infrastructure) repo, add your queue to the event triggers in `terraform/(dev,prod)/us-west-1/aws-iot-uploader/data-lakes.tf`.
```
  sqs_queues = {
    "errorreport-queue"    = "errorreport"
    "hds-sessclip-queue"   = "sessclip"
    "hds-files-queue"      = "hdsfiles"
    "hds-jobresults-queue" = "jobresults"
    "hds-versions-queue"   = "versions"
    "your-queue-name-from-step-1" = "[The S3 prefix where the uploader will place the files]" 
  }
```


All of these steps will require someone with proper authentication to deploy to the production account.

## Development and deployment cycle
The typical development cycle is: Develop locally -> Create PR for review -> deploy to AWS dev account -> deploy to production. Developers, in general, are not authorized to deploy code to the production environment. Typically, we want to ensure that we are happy with our models and that the migrations are unlikely to change before deploying to the development server. This usually means going through the full PR review process before deploying.

### Deploying HDS
#### Changes to Terraform only
From `terraform/(dev,prod)/(backend,hds,frontend)/`
- `terraform init` if it is the first time or `terraform init -upgrade`
- `terraform plan -out apply.tfplan`
  - Ensure that all of the changes are expected
- `terraform apply apply.tfplan`

#### Changes to source code
From `make/(dev,prod)/` or `frontend/make/(dev,prod)/`
- `make all`
- Copy the image url
  - e.g. `082346306812.dkr.ecr.us-west-1.amazonaws.com/hds:hds-staging-07fb69a9`
- paste into the appropriate terraform file
  - e.g. `terraform/dev/hds.tf` in `locals` set `service_docker_image` value
- Follow terraform steps above

Often there will be multiple changes to source and terraform, each case should be carefully reviewed before being applied.

#### Migrating the database
This can be done either by setting the `MIGRATE` flag to `true` when creating the terraform plan, or by sending an authenticated `GET` or `POST` request to the API server at the endpoint `/api/v1/hdsmigrations/migrate/`. At the moment, only certain users can reach this endpoint and even fewer can migrate on deployment.

## Postman
[Postman](https://www.postman.com/) is a software tool for testing API endpoints and workflows. We currently use it primarily
for testing new endpoints as we develop. Included in this repo in the `postman` directory are JSON configs for the Postman 
environment variables and HTTP collections. To get set up with postman:
1. Install postman
    - snap: `$ snap install postman` (easiest, you may also need to install snap)
    - [Manual](https://learning.postman.com/docs/getting-started/installation-and-updates/#installing-postman-on-linux)
2. Run postman
    - `$ postman`
3. Import collection and environment
    - File -> import -> upload -> select both jsons

You will now see `hds` in the collections tab and `hds local` in the environments tab. Set `hds local` as the active environment.
Each endpoint is organized into it's own folder, with `GET`/`POST`/etc.. methods defined. If changes are made to the environment 
or the collection, they should be exported and stored in the `postman` directory.

You can now run the HDS server and execute requests from Postman. By default, the port is set to `8085`. If HDS is running on a 
different port, it must be changed to match in postman.
 