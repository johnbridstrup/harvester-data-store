from django.contrib import admin
from .models import GripReport


class GripReportAdmin(admin.ModelAdmin):
    list_display = ('reportTime', 'location', 'harvester', 'creator', 'modifiedBy')
    ordering = ('location', 'harvester', 'reportTime', 'creator', 'modifiedBy')
    search_fields = ('location__ranch', 'harvester__name', 'creator__username',)


admin.site.register(GripReport, GripReportAdmin)