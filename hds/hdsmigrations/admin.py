from django.contrib import admin

from .models import MigrationLog


class MigrationLogAdmin(admin.ModelAdmin):
    list_display = ("result", "startTime", "endTime", "creator", "created")
    ordering = ("created", "result")
    search_fields = ("result", "creator")


admin.site.register(MigrationLog, MigrationLogAdmin)
