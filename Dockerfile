# Dockerfile

FROM python:3.8-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /var/log/supervisor
RUN mkdir -p /opt/app/hds/
WORKDIR /opt/app

# Install debian packages
RUN apt update && apt install -y\
    libpq-dev\
    python-dev\
    supervisor\
    python3-pip\
    virtualenv\
    && rm -rf /var/lib/apt/lists/*

# SQS-client
COPY debian_packages/aft-sqs-client_0.3-1_all.deb /opt/app/
RUN dpkg -i /opt/app/aft-sqs-client_0.3-1_all.deb
RUN rm /opt/app/aft-sqs-client_0.3-1_all.deb

# Install pip packages
COPY requirements.txt /opt/app/
RUN pip install -r requirements.txt --no-cache-dir

# Copy source, scripts and configs
COPY scripts/ /opt/app/scripts/
COPY supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY hds /opt/app/hds/

RUN chown -R www-data:www-data /opt/app

CMD ["supervisord"]
