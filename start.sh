#!/bin/bash

source venv/bin/activate

export HDS_ROOT="$( git rev-parse --show-toplevel )"

alias runserver="$HDS_ROOT/scripts/start-dev-server.sh"
alias stopserver="docker compose down -v"
alias migrations="docker compose exec web python hds/manage.py makemigrations"
alias migrate="docker compose exec web python hds/manage.py migrate --noinput"
alias createsuperuser="docker compose exec web python hds/manage.py createsuperuser"
alias manage="docker compose exec web python hds/manage.py"
alias dcexec="docker compose exec web"
alias dbexec="docker compose exec db"
alias HELP="$HDS_ROOT/scripts/help.sh"
alias setport="source $HDS_ROOT/scripts/set_port.sh"
alias hds-logs="docker compose logs web"
alias db-logs="docker compose logs db"
alias install-node="$HDS_ROOT/install-node.sh"
alias build="$HDS_ROOT/build.sh"

PORT=$1
if [ -z $PORT ]
then
    PORT=8085
fi
source $HDS_ROOT/scripts/set_port.sh $PORT

if [ -d "${HDS_ROOT}/multiproc-tmp" ]
then
    rm ${HDS_ROOT}/multiproc-tmp/*
else
    mkdir $HDS_ROOT/multiproc-tmp
fi

export PROMETHEUS_MULTIPROC_DIR=$HDS_ROOT/multiproc-tmp

echo ""
echo "You are in the Harvester Data Store development environment"
echo "  - Start the server with runserver"
echo "  - Run HELP for useful information and aliases"
echo "  - Server will run on localhost:$HDS_PORT"
echo ""
echo "Start the dev prometheus server with: "
echo "  sudo prometheus --config.file=$HDS_ROOT/prometheus/prometheus.yml"