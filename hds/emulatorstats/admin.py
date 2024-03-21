from typing import Any
from django.contrib import admin
from django.db.models.query import QuerySet
from django.http import HttpRequest

from .models import EmustatsReport


class EmustatsReportAdmin(admin.ModelAdmin):
    list_display = ('scene', 'branch', 'date', 'runner', 'created')
    ordering = ('-created', 'scene', 'date', 'runner')
    search_fields = ('scene', 'branch', 'date', 'runner', 'created')

    def get_queryset(self, request: HttpRequest) -> QuerySet[Any]:
        qs = super().get_queryset(request)
        return qs.select_related(
            "event",
            "harvester",
            "location",
            "pick_session",
            "creator",
            "modifiedBy",
        ).prefetch_related("tags")


admin.site.register(EmustatsReport, EmustatsReportAdmin)
