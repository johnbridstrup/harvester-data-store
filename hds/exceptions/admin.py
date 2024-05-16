from django.contrib import admin

from .models import AFTExceptionCode, AFTException, AFTExceptionCodeManifest


class AFTExceptionCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "name")
    ordering = ("code",)
    search_fields = ("code", "name")


class AFTExceptionAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "code", "service", "node")
    ordering = ("timestamp",)
    search_fields = ("timestamp", "code", "name")


class AFTExceptionCodeManifestAdmin(admin.ModelAdmin):
    list_display = ("created", "version")
    ordering = ("created",)
    search_fields = ("version",)


admin.site.register(AFTExceptionCode, AFTExceptionCodeAdmin)
admin.site.register(AFTException, AFTExceptionAdmin)
admin.site.register(AFTExceptionCodeManifest, AFTExceptionCodeManifestAdmin)
