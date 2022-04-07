# Dockerfile

FROM python:3.8-slim-bullseye

# copy source and install dependencies
RUN mkdir -p /opt/app/hds
COPY requirements.txt scripts/start-server.sh /opt/app/
COPY hds /opt/app/hds/
WORKDIR /opt/app
RUN pip install -r requirements.txt --no-cache-dir
RUN chown -R www-data:www-data /opt/app
