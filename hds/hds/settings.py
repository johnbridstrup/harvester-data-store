"""
Django settings for hds project.

Generated by 'django-admin startproject' using Django 4.0.3.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.0/ref/settings/
"""
import logging
import os
import sys

from pathlib import Path
from structlog.exceptions import DropEvent
from urllib.parse import parse_qs, urlparse

# UTILS
# These must be defined here otherwise we get issues with app modules being loaded too soon
def check_env(env_var, default=False):
    """Check if env flag is set to true"""
    val = os.environ.get(env_var)
    if val is None:
        return default
    else:
        return val.lower() in ["true", "1"]


# SETTINGS

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_DIR = Path(__file__).resolve().parent.parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/

# ENVIRONMENT VARIABLES

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-rzr+x&83_l1%9sc-hj)!7i8!^*^s&(+5v1v8vehxoyd5(8f_%x",
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = check_env("DEBUG", default=True)

CLOUDWATCH = check_env("CLOUDWATCH")
FRONTEND_PORT = os.environ.get("FRONTEND_PORT", "3000")
PAGE_CACHING = check_env("PAGE_CACHING")
SILK_PROFILING = check_env("SILK_PROFILING")
SILKY_PYTHON_PROFILER = SILK_PROFILING and check_env("SILK_CPROFILE")
USES3 = check_env("USES3")


ALLOWED_HOSTS = ["*"]
CSRF_TRUSTED_ORIGINS = [
    "https://*.cloud.advanced.farm",
    "https://*.devcloud.advanced.farm",
    f"http://localhost:{FRONTEND_PORT}",
]


# Application definition

LOCAL_APPS = [
    "admin_utils",
    "aftconfigs",
    "autodiagnostics",
    "chatbot",
    "common",
    "location",
    "hdsmigrations",
    "emulatorstats",
    "errorreport",
    "event",
    "exceptions",
    "gripreport",
    "harvester",
    "harvassets",
    "harvdeploy",
    "harvjobs",
    "healthcheck",
    "jobscheduler",
    "notifications",
    "s3file",
    "logparser",
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_roles",
    "rest_framework.authtoken",
    "simple_history",
    "corsheaders",
    "django_prometheus",
    "django_celery_beat",
    "django_celery_results",
    "django_filters",
    "silk",
    "taggit",
] + LOCAL_APPS

MIDDLEWARE = [
    "django_prometheus.middleware.PrometheusBeforeMiddleware",
    "django_structlog.middlewares.RequestMiddleware",
    "django_structlog.middlewares.CeleryMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django_prometheus.middleware.PrometheusAfterMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
]

if SILK_PROFILING:
    MIDDLEWARE = ["silk.middleware.SilkyMiddleware"] + MIDDLEWARE

# LOGGING

import copy, structlog

local_logger_conf = {
    "handlers": ["console"],
    "level": "DEBUG" if DEBUG else "INFO",
    "propagate": False,
}

# Cloudwatch healtcheck filter
def ignore_healtcheck_metrics_get(logger, method_name, event_dict):
    # Check if the log event request is GET *healthcheck*
    if (
        event_dict.get("request")
        and "GET" in event_dict["request"]
        and (
            "healthcheck" in event_dict["request"]
            or "metrics" in event_dict["request"]
        )
    ):
        # Ignore if we are in cloudwatch environment
        if CLOUDWATCH:
            raise DropEvent

    # Otherwise, pass along as usual
    return event_dict


# Test requests log filter


def limit_test_logging(logger, method_name, event_dict):
    if event_dict.get("request") is None:
        return event_dict

    parsed_url = urlparse(event_dict["request"])
    query_dict = parse_qs(parsed_url.query)
    if "is_beatbox_request" in query_dict:
        # Ignore if we are in cloudwatch environment
        event_dict["BEATBOX_REQUEST"] = True
        if CLOUDWATCH:
            raise DropEvent
    # Otherwise, pass along as usual
    return event_dict


LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "console" if not CLOUDWATCH else "cloudwatch",
        },
    },
    "loggers": {
        "": {
            "handlers": ["console"],
            "level": "WARNING",
        },
        "django_structlog": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        **{app: copy.deepcopy(local_logger_conf) for app in LOCAL_APPS},
    },
    "formatters": {
        "console": {
            "()": structlog.stdlib.ProcessorFormatter,
            "processor": structlog.dev.ConsoleRenderer(),
        },
        "cloudwatch": {
            "()": structlog.stdlib.ProcessorFormatter,
            "processor": structlog.processors.LogfmtRenderer(),
        },
    },
}
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.filter_by_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        ignore_healtcheck_metrics_get,
        limit_test_logging,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

ROOT_URLCONF = "hds.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "hds.wsgi.application"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "EXCEPTION_HANDLER": "common.utils.custom_exception_handler",
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "DEFAULT_SCHEMA_CLASS": "common.schema.HDSAutoSchema",
    "PAGE_SIZE": 10,
}

REST_FRAMEWORK_ROLES = {
    "roles": "hds.roles.ROLES",
}


# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": os.environ.get(
            "SQL_ENGINE", "django_prometheus.db.backends.sqlite3"
        ),
        "NAME": os.environ.get("POSTGRES_NAME", BASE_DIR / "db.sqlite3"),
        "USER": os.environ.get("POSTGRES_USER", "user"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "password"),
        "HOST": os.environ.get("SQL_HOST", "localhost"),
        "PORT": os.environ.get("SQL_PORT", "5432"),
        "CONN_HEALTH_CHECKS": True,
    }
}

# Cache
REDIS_DEFAULT_URL = "redis://localhost:6379"


if not PAGE_CACHING:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.dummy.DummyCache",
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django_prometheus.cache.backends.redis.RedisCache",
            "LOCATION": os.environ.get("BROKER_URL", REDIS_DEFAULT_URL),
        }
    }

# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/

if USES3:
    AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME")
    if AWS_STORAGE_BUCKET_NAME is None:
        logging.error("bucket name was not provided")
        raise EnvironmentError("bucket name should not be none")
    AWS_QUERYSTRING_AUTH = True
    AWS_S3_OBJECT_PARAMETERS = {
        "CacheControl": "max-age=86400",
    }

    STATICFILES_STORAGE = "hds.storages.StaticStorage"
    DEFAULT_FILE_STORAGE = "hds.storages.MediaStorage"

STATIC_URL = "/static/"
MEDIA_URL = "/media/"

STATIC_ROOT = os.environ.get("STATIC_ROOT", os.path.join(BASE_DIR, "static/"))
MEDIA_ROOT = os.environ.get("MEDIA_ROOT", os.path.join(BASE_DIR, "media/"))


# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

PROMETHEUS_LATENCY_BUCKETS = (
    0.1,
    0.2,
    0.5,
    0.6,
    0.8,
    1.0,
    2.0,
    3.0,
    4.0,
    5.0,
    6.0,
    7.5,
    9.0,
    12.0,
    15.0,
    20.0,
    30.0,
    float("inf"),
)

# Causes errors during testing if True
PROMETHEUS_EXPORT_MIGRATIONS = os.environ.get(
    "PROMETHEUS_EXPORT_MIGRATIONS", "false"
) in ["true", "True", "1"]

# Celery
CELERY_RESULT_BACKEND = "django-db"
CELERY_CACHE_BACKEND = "redis"
CELERY_BROKER_URL = os.environ.get("BROKER_URL", REDIS_DEFAULT_URL)

# Test vars
if "test" in sys.argv[1:]:
    BROKER_BACKEND = "memory"
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True
    MEDIA_ROOT = os.path.join(BASE_DIR, "test_media/")

old_umask = os.umask(0)
os.makedirs(MEDIA_ROOT, mode=0o777, exist_ok=True)
os.umask(old_umask)

DOWNLOAD_DIR = os.path.join(MEDIA_ROOT, "downloads")
EXTRACT_DIR = os.path.join(MEDIA_ROOT, "extracts")
FILE_UPLOAD_MAX_MEMORY_SIZE = 300 * 1024 * 1024  # bytes

# Github creds
GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET")
GITHUB_ORG = os.environ.get("GITHUB_ORG", "AdvancedFarm")
