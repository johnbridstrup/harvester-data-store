from django.contrib import admin

from .models import S3File, SessClip


class S3FileAdmin(admin.ModelAdmin):
    list_display = ("created", "filetype", "event")
    ordering = ("created", "filetype")
    search_fields = ("filetype", "created")


class SessClipAdmin(admin.ModelAdmin):
    list_display = ("get_created", "get_creator", "file")

    def get_created(self, obj):
        return obj.file.created

    def get_creator(self, obj):
        return obj.file.creator.username

    get_created.short_description = "created"
    get_creator.short_description = "creator"


admin.site.register(S3File, S3FileAdmin)
admin.site.register(SessClip, SessClipAdmin)
