from django.contrib import admin
from .models import GripReport, Candidate, Grip


class GripReportAdmin(admin.ModelAdmin):
    list_display = ("reportTime", "location", "harvester", "creator", "modifiedBy")
    ordering = ("location", "harvester", "reportTime", "creator", "modifiedBy")
    search_fields = (
        "location__ranch",
        "harvester__name",
        "creator__username",
    )


class CandidateAdmin(admin.ModelAdmin):
    list_display = ("fruit", "harvester", "robot_id", "score", "cand_id")
    ordering = ("created",)
    search_fields = ("fruit__name", "harvester__name", "robot_id", "cand_id")


class GripAdmin(admin.ModelAdmin):
    list_display = ("fruit", "harvester", "success", "robot_id")
    ordering = ("created",)
    search_fields = ("fruit__name", "harvester__name", "success", "robot_id")


admin.site.register(GripReport, GripReportAdmin)
admin.site.register(Candidate, CandidateAdmin)
admin.site.register(Grip, GripAdmin)
