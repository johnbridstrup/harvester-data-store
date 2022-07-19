# Dockerfile

FROM python:3.8-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install psycopg2 dependencies
RUN apt update && apt install -y\
    libpq-dev\
    python-dev\
    supervisor\
    && rm -rf /var/lib/apt/lists/*

# copy source and install dependencies
RUN mkdir -p /opt/app/hds
COPY requirements.txt /opt/app/
COPY scripts/ /opt/app/scripts
COPY supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY hds /opt/app/hds/
WORKDIR /opt/app
RUN pip install -r requirements.txt --no-cache-dir
RUN chown -R www-data:www-data /opt/app
RUN mkdir -p /var/log/supervisor
RUN python hds/manage.py collectstatic --no-input

CMD ["/opt/app/scripts/start-server.sh", "8000"]