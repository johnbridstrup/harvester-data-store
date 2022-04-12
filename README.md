# Harveseter Data Store

The central hub for all AFT Harvester data.

## Bootstrapping
Clone the repo, `cd` in and run `./setup-venv.sh`. This script will create a `venv` and 
install python requirements, `Docker` and `Docker Desktop`. Enter the development environment with `source start.sh`. 
This will activate the venv and define some useful aliases. To see what aliases are defined, run `HELP`. To verify 
that everything is working correctly, run `runserver` and navigate to `localhost:8010` in your browser.

These scripts are only verified in Ubuntu 20.04 but should run in other versions. On other 
operating systems or linux distributions, you may have to install the dependencies manually.

## Development
The top level `hds` directory (notice the lower case) is a shared volume with the development container. So changes
can be made in your usual IDE and they will be applied in real time to the server.
 