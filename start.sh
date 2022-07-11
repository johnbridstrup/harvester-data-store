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

PORT=$1
if [ -z $PORT ]
then
    PORT=8085
fi
source $HDS_ROOT/scripts/set_port.sh $PORT

echo ""
echo "You are in the Harvester Data Store development environment"
echo "  - Start the server with runserver"
echo "  - Run HELP for useful information and aliases"
echo "  - Server will run on localhost:$HDS_PORT"
echo ""