from django.contrib import admin

from .models import EmustatsReport


class EmustatsReportAdmin(admin.ModelAdmin):
    list_display = ('scene', 'branch', 'date', 'runner', 'created')
    ordering = ('-created', 'scene', 'date', 'runner')
    search_fields = ('scene', 'branch', 'date', 'runner', 'created')


admin.site.register(EmustatsReport, EmustatsReportAdmin)
