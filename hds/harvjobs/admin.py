from typing import Any
from django.contrib import admin
from django.db.models.query import QuerySet
from django.http import HttpRequest

from .models import JobType, JobSchema, JobResults, Job


class JobSchemaInline(admin.TabularInline):
    model = JobSchema


class JobTypeAdmin(admin.ModelAdmin):
    list_display = ('created', 'name')
    ordering = ('created',)
    search_fields = ('created', 'name')
    inlines = [JobSchemaInline]


class JobSchemaAdmin(admin.ModelAdmin):
    list_display = ('created', 'get_jobtype', 'version', 'schema')
    ordering = ('created',)
    search_fields = ('created', 'get_jobtype', 'version')

    @admin.display(ordering='name', description='job type')
    def get_jobtype(self, obj):
        return obj.jobtype.name


class JobResultsAdmin(admin.ModelAdmin):
    list_display = ('created', 'report')
    ordering = ('created',)
    search_fields = ('created', 'status')

    def get_queryset(self, request: HttpRequest) -> QuerySet[Any]:
        qs = super().get_queryset(request)
        return qs.select_related(
            "creator",
            "modifiedBy",
            "harvester",
            "location",
            "event",
            "job",
        ).prefetch_related("tags", "host_results")


class JobAdmin(admin.ModelAdmin):
    list_display = ('created', 'get_jobtype', 'get_target', 'jobstatus')

    @admin.display(ordering='harv_id', description='Harv ID')
    def get_target(self, obj):
        return obj.target.harv_id

    @admin.display(ordering='name', description='job type')
    def get_jobtype(self, obj):
        return obj.schema.jobtype.name

    def get_queryset(self, request: HttpRequest) -> QuerySet[Any]:
        qs = super().get_queryset(request)
        return qs.select_related(
            "schema",
            "target",
            "event",
            "creator",
            "modifiedBy",
        )


admin.site.register(JobType, JobTypeAdmin)
admin.site.register(JobSchema, JobSchemaAdmin)
admin.site.register(JobResults, JobResultsAdmin)
admin.site.register(Job, JobAdmin)