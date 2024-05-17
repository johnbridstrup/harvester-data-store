from typing import Any
from django.contrib import admin
from django.http import HttpRequest
from .models import AutodiagnosticsReport, AutodiagnosticsRun


class AutodiagnosticsReportAdmin(admin.ModelAdmin):
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


class AutodiagnosticsRunAdmin(admin.ModelAdmin):
    list_display = (
        "run_timestamp",
        "result",
    )
    ordering = ("-run_timestamp",)


admin.site.register(AutodiagnosticsReport, AutodiagnosticsReportAdmin)
admin.site.register(AutodiagnosticsRun, AutodiagnosticsRunAdmin)
