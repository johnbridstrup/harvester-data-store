# Dockerfile

FROM python:3.8-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install psycopg2 dependencies
RUN apt update && apt install -y\
    libpq-dev\
    python-dev\
    && rm -rf /var/lib/apt/lists/*

# copy source and install dependencies
RUN mkdir -p /opt/app/hds
COPY requirements.txt scripts/start-server.sh /opt/app/
COPY hds /opt/app/hds/
WORKDIR /opt/app
RUN pip install -r requirements.txt --no-cache-dir
RUN chown -R www-data:www-data /opt/app
