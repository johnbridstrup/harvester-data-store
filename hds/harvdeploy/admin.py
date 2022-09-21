from django.contrib import admin

from .models import HarvesterCodeRelease


class HarvesterCodeReleaseAdmin(admin.ModelAdmin):
    list_display = ('created', 'version', 'fruit')
    ordering = ('created',)
    search_fields = ('created', 'fruit')


admin.site.register(HarvesterCodeRelease, HarvesterCodeReleaseAdmin)