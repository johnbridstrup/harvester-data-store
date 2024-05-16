from django.contrib import admin

from .models import ScheduledJob


class ScheduledJobAdmin(admin.ModelAdmin):
    list_display = ("task", "schedule_status", "num_runs")
    ordering = ("created",)
    search_fields = ("task", "schedule_status", "creator__username")


admin.site.register(ScheduledJob, ScheduledJobAdmin)
