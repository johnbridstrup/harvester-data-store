#!/bin/bash

source venv/bin/activate

alias runserver="./scripts/start-dev-server.sh"
alias stopserver="docker compose down -v"
alias migrations="docker compose exec web python hds/manage.py makemigrations"
alias migrate="docker compose exec web python hds/manage.py migrate --noinput"
alias createsuperuser="docker compose exec web python hds/manage.py createsuperuser"
alias manage="docker compose exec web python hds/manage.py"
alias dcexec="docker compose exec web"
alias dbexec="docker compose exec db"
alias HELP="./scripts/help.sh"
alias setport="source ./scripts/set_port.sh"

PORT=$1
if [ -z $PORT ]
then
    PORT=8085
fi
source scripts/set_port.sh $PORT

echo ""
echo "You are in the Harvester Data Store development environment"
echo "  - Start the server with runserver"
echo "  - Run HELP for useful information and aliases"
echo "  - Server will run on localhost:$HDS_PORT"
echo ""