from django.contrib import admin
from logparser.models import LogFile, LogSession, LogVideo

# Register your models here.
class LogSessionAdmin(admin.ModelAdmin):
    list_display = ("name", "date_time", "harv", "creator", "modifiedBy")
    ordering = ("name", "date_time", "harv", "creator", "modifiedBy")
    search_fields = (
        "harv__name",
        "creator__username",
    )


class LogFileAdmin(admin.ModelAdmin):
    list_display = ("file_name", "service", "robot", "creator", "modifiedBy")
    ordering = ("file_name", "service", "robot", "creator", "modifiedBy")
    search_fields = (
        "file_name",
        "service",
        "robot",
        "creator__username",
    )


class LogVideoAdmin(admin.ModelAdmin):
    list_display = ("file_name", "category", "robot", "creator", "modifiedBy")
    ordering = ("file_name", "category", "robot", "creator", "modifiedBy")
    search_fields = (
        "file_name",
        "category",
        "robot",
        "creator__username",
    )


admin.site.register(LogSession, LogSessionAdmin)
admin.site.register(LogFile, LogFileAdmin)
admin.site.register(LogVideo, LogVideoAdmin)
