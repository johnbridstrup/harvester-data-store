# Harveseter Data Store

The central hub for all AFT Harvester data.

## Bootstrapping
Clone the repo, `cd` in and run `./setup-venv.sh`. This script will create a `venv` and 
install python requirements, `Docker` and `Docker Desktop`. Enter the development environment with `source start.sh`.
This will activate the venv, define some useful aliases and create the `.env` file. 
To see what aliases are defined, run `HELP`. 
To verify that everything is working correctly, run `runserver` and navigate to `localhost:${HDS_PORT}` in your browser.

`HDS_PORT` is set by being passed directly to to the start script `source start.sh XXXX`, sourced from your local environment,
set to the default `8085` or chosen randomly from open ports on the system, in that order of priority. It can be changed at
any time by running `setport XXXX` or `./set_port.sh XXXX` from the project root.

These scripts are only verified in Ubuntu 20.04 but should run in other versions. On other 
operating systems or linux distributions, you may have to install the dependencies manually.

## Development
The top level `hds` directory (notice the lower case) is a shared volume with the development container. So changes
can be made in your usual IDE and they will be applied in real time to the server.

Two users are initially populated if you use `runserver`:
- User: aft; Password: aft (admin)
- User: notaft; Password: dummypwd (not admin)
 