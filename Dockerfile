# Dockerfile

FROM python:3.8-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /opt/app/hds

# Install dependencies
RUN apt update && apt install -y\
    libpq-dev\
    python-dev\
    supervisor\
    python3-pip\
    virtualenv

# Nexus keyring and sqs-client
COPY debian_packages/aft-nexus-eng-keyring_1.1-2_all.deb /opt/app/
RUN dpkg -i /opt/app/aft-nexus-eng-keyring_1.1-2_all.deb
RUN rm /opt/app/aft-nexus-eng-keyring_1.1-2_all.deb
RUN apt update && apt install -y\
    aft-sqs-client\
    && rm -rf /var/lib/apt/lists/*

# copy source and install dependencies
COPY requirements.txt /opt/app/
COPY scripts/wait-for-it.sh scripts/start-server.sh /opt/app/scripts/
COPY supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY hds /opt/app/hds/
WORKDIR /opt/app
RUN pip install -r requirements.txt --no-cache-dir
RUN chown -R www-data:www-data /opt/app
RUN mkdir -p /var/log/supervisor
RUN python hds/manage.py collectstatic --no-input

CMD ["supervisord"]