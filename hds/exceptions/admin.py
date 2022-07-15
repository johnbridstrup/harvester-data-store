from django.contrib import admin

from .models import AFTExceptionCode, AFTException


class AFTExceptionCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name')
    ordering = ('code',)
    search_fields = ('code', 'name')


class AFTExceptionAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'code', 'service', 'node')
    ordering = ('timestamp',)
    search_fields = ('timestamp', 'code', 'name')


admin.site.register(AFTExceptionCode, AFTExceptionCodeAdmin)
admin.site.register(AFTException, AFTExceptionAdmin)