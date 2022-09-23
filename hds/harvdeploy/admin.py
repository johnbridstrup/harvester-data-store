from django.contrib import admin

from .models import HarvesterCodeRelease, HarvesterVersionReport


class HarvesterCodeReleaseAdmin(admin.ModelAdmin):
    list_display = ('created', 'version', 'fruit')
    ordering = ('created',)
    search_fields = ('created', 'fruit')

class HarvesterVersionReportAdmin(admin.ModelAdmin):
    list_display = ('created', 'report', 'is_dirty')
    ordering = ('created',)
    search_fields = ('created', 'is_dirty')


admin.site.register(HarvesterCodeRelease, HarvesterCodeReleaseAdmin)
admin.site.register(HarvesterVersionReport, HarvesterVersionReportAdmin)