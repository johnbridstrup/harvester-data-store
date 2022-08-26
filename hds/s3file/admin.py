from django.contrib import admin

from .models import S3File


class S3FileAdmin(admin.ModelAdmin):
    list_display = ('created', 'filetype', 'event')
    ordering = ('created', 'filetype')
    search_fields = ('fieltype', 'created')


admin.site.register(S3File, S3FileAdmin)
