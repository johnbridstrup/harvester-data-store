from typing import Any
from django.contrib import admin
from django.db.models.query import QuerySet
from django.http import HttpRequest
from .models import ConfigReport


class ConfigReportAdmin(admin.ModelAdmin):
    list_display = (
        "reportTime",
        "location",
        "harvester",
        "creator",
        "modifiedBy",
    )
    ordering = ("location", "harvester", "reportTime", "creator", "modifiedBy")
    search_fields = (
        "location__ranch",
        "harvester__name",
        "creator__username",
    )

    def get_queryset(self, request: HttpRequest) -> QuerySet[Any]:
        qs = super().get_queryset(request)
        return qs.prefetch_related(
            "harvester",
            "location",
            "event",
        ).select_related(
            "creator",
            "modifiedBy",
        )


admin.site.register(ConfigReport, ConfigReportAdmin)
