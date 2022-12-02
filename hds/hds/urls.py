"""hds URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework.schemas import get_schema_view

version = 'api/v1'

urlpatterns = [
    path('', include('common.urls.landingurls')),
    path('admin/', admin.site.urls),
    path(f'{version}/fruits/', include('harvester.urls.fruiturls')),
    path(f'{version}/harvesters/', include('harvester.urls.harvesterurls')),
    path(f'{version}/harvesterhistory/', include('harvester.urls.harvesterhistoryurls')),
    path(f'{version}/locations/', include('location.urls.locationurls')),
    path(f'{version}/distributors/', include('location.urls.distributorurls')),
    path(f'{version}/errorreports/', include('errorreport.urls')),
    path(f'{version}/events/', include('event.urls')),
    path(f'{version}/exceptioncodes/', include('exceptions.urls.exceptioncodeurls')),
    path(f'{version}/exceptioncodemanifests/', include('exceptions.urls.exceptioncodemanifesturls')),
    path(f'{version}/exceptions/', include('exceptions.urls.exceptionurls')),
    path(f'{version}/migrations/', include('hdsmigrations.urls')),
    path(f'{version}/notifications/', include('notifications.urls')),
    path(f'{version}/s3files/', include('s3file.urls')),
    path(f'{version}/sessclip/', include('s3file.urls')),
    path(f'{version}/release/', include('harvdeploy.urls.harvestercodereleaseurls')),
    path(f'{version}/harvversion/', include('harvdeploy.urls.harvesterversionreporturls')),
    path(f'{version}/jobtypes/', include('harvjobs.urls.jobtypeurls')),
    path(f'{version}/jobschemas/', include('harvjobs.urls.jobschemaurls')),
    path(f'{version}/jobresults/', include('harvjobs.urls.jobresultsurls')),
    path(f'{version}/harvjobs/', include('harvjobs.urls.joburls')),
    path(f'{version}/users/', include('common.urls.userurls')),
    path(f'{version}/healthcheck/', include('healthcheck.urls')),
    path(
        f'{version}/openapi',
        get_schema_view(
            title="Harvester Data Store",
            description="Home of reports and files generated by AFT harvester",
            version='1.0'
        ),
        name='openapi-schema'
    ),
    path('', include('django_prometheus.urls')), #/metrics, etc...        
]

if settings.DEBUG is True:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

