from typing import Any
from django.contrib import admin
from django.db.models.query import QuerySet
from django.http import HttpRequest
from .models import Event, PickSession


class EventAdmin(admin.ModelAdmin):
    list_display = ('created', 'UUID', 'tag_list')
    ordering = ('created',)
    search_fields = ('created', 'UUID')

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('tags', 'secondary_events',)

    def tag_list(self, obj):
        return u", ".join(o.name for o in obj.tags.all())


class PickSessionAdmin(admin.ModelAdmin):
    list_display = ('created', 'UUID', 'start_time', 'session_length', 'tag_list')
    ordering = ('created',)
    search_fields = ('created', 'UUID', 'start_time')

    def get_queryset(self, request: HttpRequest) -> QuerySet[Any]:
        qs = super().get_queryset(request)
        return qs.select_related("harvester","location").prefetch_related("tags")

    def tag_list(self, obj):
        return u", ".join(o.name for o in obj.tags.all())


admin.site.register(Event, EventAdmin)
admin.site.register(PickSession, PickSessionAdmin)
